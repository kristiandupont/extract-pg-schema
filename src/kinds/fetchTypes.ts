import { type DbConnection, query } from "../db";

import fetchExtensionItemIds from "../fetchExtensionItemIds";
import type PgType from "./PgType";
import { classKindMap, typeKindMap } from "./PgType";

const fetchTypes = async (
  db: DbConnection,
  schemaNames: string[],
): Promise<PgType[]> => {
  // We want to ignore everything belonging to etensions. (Maybe this should be optional?)
  const { extClassOids, extTypeOids, extProcOids } =
    await fetchExtensionItemIds(db);

  const classKindCases = Object.entries(classKindMap)
    .map(([key, classKind]) => `when '${key}' then '${classKind}'`)
    .join("\n");
  const typeKindCases = Object.entries(typeKindMap)
    .map(([key, typeKind]) => `when '${key}' then '${typeKind}'`)
    .join("\n");

  return query<PgType>(
    db,
    `
    SELECT
      typname AS "name",
      nspname AS "schemaName",
      CASE typtype
        WHEN 'c' THEN CASE relkind
          ${classKindCases}
        END
        ${typeKindCases}
      END AS "kind",
      -- Comments on the class take precedence, but for composite types,
      -- they will reside on the type itself.
      COALESCE(
        obj_description(COALESCE(pg_class.oid, pg_type.oid)),
        obj_description(pg_type.oid)
      ) AS "comment"
    FROM pg_catalog.pg_type
    JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    FULL OUTER JOIN pg_catalog.pg_class ON pg_type.typrelid = pg_class.oid
    WHERE (
        pg_class.oid IS NULL
        OR (
          pg_class.relispartition = false
          AND pg_class.relkind <> 'S'
          AND pg_class.oid <> ALL(:ext_class_oids)
        )
      )
      AND pg_type.oid <> ALL(:ext_type_oids)
      AND pg_type.typtype = ANY(:type_kinds)
      AND pg_namespace.nspname = ANY(:schema_names)

    UNION

    SELECT
      proname AS "name",
      nspname AS "schemaName",
      CASE prokind
        WHEN 'f' THEN 'function'
        WHEN 'p' THEN 'procedure'
        WHEN 'a' THEN 'aggregate'
        WHEN 'w' THEN 'window'
      END AS "kind",
      obj_description(pg_proc.oid) AS "comment"
    FROM pg_catalog.pg_proc
    JOIN pg_catalog.pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    JOIN pg_catalog.pg_language ON pg_language.oid = pg_proc.prolang
    WHERE pg_proc.oid <> ALL(:ext_proc_oids)
      AND pg_namespace.nspname = ANY(:schema_names)
      -- TODO: Add support for aggregate ('a') and window ('w') functions
      AND prokind IN ('f', 'p')
      AND pg_language.lanname <> 'internal'
    `,
    {
      ext_class_oids: extClassOids,
      ext_type_oids: extTypeOids,
      type_kinds: ["c", ...Object.keys(typeKindMap)],
      schema_names: schemaNames,
      ext_proc_oids: extProcOids,
    },
  );
};

export default fetchTypes;
