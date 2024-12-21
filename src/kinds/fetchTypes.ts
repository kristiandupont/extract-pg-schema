import type { Knex } from "knex";

import fetchExtensionItemIds from "../fetchExtensionItemIds";
import type PgType from "./PgType";
import { classKindMap, typeKindMap } from "./PgType";

const fetchTypes = async (
  db: Knex,
  schemaNames: string[],
): Promise<PgType[]> => {
  // We want to ignore everything belonging to etensions. (Maybe this should be optional?)
  const { extClassOids, extTypeOids } = await fetchExtensionItemIds(db);

  const typeQuery = db
    .select(
      "typname as name",
      "nspname as schemaName",
      db.raw(`case typtype
        when 'c' then case relkind
          ${Object.entries(classKindMap)
            .map(([key, classKind]) => `when '${key}' then '${classKind}'`)
            .join("\n")}
          end
      ${Object.entries(typeKindMap)
        .map(([key, typeKind]) => `when '${key}' then '${typeKind}'`)
        .join("\n")}
       end as kind`),
      db.raw(
        // Comments on the class take prescedent, but for composite types,
        // they will reside on the type itself.
        `COALESCE(
          obj_description(COALESCE(pg_class.oid, pg_type.oid)), 
          obj_description(pg_type.oid)
        ) as comment`,
      ),
    )
    .from("pg_catalog.pg_type")
    .join("pg_catalog.pg_namespace", "pg_namespace.oid", "pg_type.typnamespace")
    .fullOuterJoin("pg_catalog.pg_class", "pg_type.typrelid", "pg_class.oid")
    .where((b1) =>
      b1
        .where("pg_class.oid", "is", null)
        .orWhere((b2) =>
          b2
            .where("pg_class.relispartition", false)
            .whereNotIn("pg_class.relkind", ["S"])
            .whereNotIn("pg_class.oid", extClassOids),
        ),
    )
    .whereNotIn("pg_type.oid", extTypeOids)
    .whereIn("pg_type.typtype", ["c", ...Object.keys(typeKindMap)])
    .whereIn("pg_namespace.nspname", schemaNames);

  const procQuery = db
    .select(
      "proname as name",
      "nspname as schemaName",
      db.raw(`case prokind
        when 'f' then 'function'
        when 'p' then 'procedure'
        when 'a' then 'aggregate'
        when 'w' then 'window'
        end as kind`),
      db.raw("obj_description(pg_proc.oid) as comment"),
    )
    .from("pg_catalog.pg_proc")
    .join("pg_catalog.pg_namespace", "pg_namespace.oid", "pg_proc.pronamespace")
    .join("pg_catalog.pg_language", "pg_language.oid", "pg_proc.prolang")
    .whereNotIn("pg_proc.oid", extClassOids)
    .whereIn("pg_namespace.nspname", schemaNames)
    .whereIn("prokind", ["f", "p", "a", "w"])
    .whereNot("pg_language.lanname", "internal");

  return typeQuery.union(procQuery);
};

export default fetchTypes;
