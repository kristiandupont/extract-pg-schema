import { Knex } from 'knex';

import fetchExtensionItemIds from './fetchExtensionItemIds';

const typeKindMap = {
  d: 'domain',
  e: 'enum',
  r: 'range',
  m: 'multiRange',
} as const;
type TypeKind = typeof typeKindMap[keyof typeof typeKindMap];

const classKindMap = {
  r: 'table',
  p: 'table', // Partitioned tables are also considered tables.
  v: 'view',
  m: 'materializedView',
  c: 'compositeType',
} as const;
type ClassKind = typeof classKindMap[keyof typeof classKindMap];

export type Kind = TypeKind | ClassKind;

export type PgType = {
  name: string;
  schemaName: string;
  kind: Kind;
  comment: string | null;
};

const fetchTypes = async (
  db: Knex,
  schemaNames: string[]
): Promise<PgType[]> => {
  // We want to ignore everything belonging to etensions. (Maybe this should be optional?)
  const { extClassOids, extTypeOids } = await fetchExtensionItemIds(db);

  return db
    .select(
      'typname as name',
      'nspname as schemaName',
      db.raw(`case typtype
        when 'c' then case relkind
      ${Object.entries(classKindMap)
        .map(([key, classKind]) => `when '${key}' then '${classKind}'`)
        .join('\n')}
       end
      ${Object.entries(typeKindMap)
        .map(([key, typeKind]) => `when '${key}' then '${typeKind}'`)
        .join('\n')}
       end as kind`),
      db.raw(
        // Comments on the class take prescedent, but for composite types,
        // they will reside on the type itself.
        `COALESCE(
          obj_description(COALESCE(pg_class.oid, pg_type.oid)), 
          obj_description(pg_type.oid)
        ) as comment`
      )
    )
    .from('pg_catalog.pg_type')
    .join('pg_catalog.pg_namespace', 'pg_namespace.oid', 'pg_type.typnamespace')
    .fullOuterJoin('pg_catalog.pg_class', 'pg_type.typrelid', 'pg_class.oid')
    .where((b1) =>
      b1
        .where('pg_class.oid', 'is', null)
        .orWhere((b2) =>
          b2
            .where('pg_class.relispartition', false)
            .whereNotIn('pg_class.relkind', ['S'])
            .whereNotIn('pg_class.oid', extClassOids)
        )
    )
    .whereNotIn('pg_type.oid', extTypeOids)
    .whereIn('pg_type.typtype', ['c', ...Object.keys(typeKindMap)])
    .whereIn('pg_namespace.nspname', schemaNames);
};

export default fetchTypes;
