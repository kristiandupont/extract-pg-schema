const indexMapQueryPart = `
  SELECT
    a.attname AS column_name,
    bool_or(ix.indisprimary) AS is_primary,
    json_agg(json_build_object(
        'name', i.relname,
        'isPrimary', ix.indisprimary)
      ) AS indices
  FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a,
    pg_namespace n
  WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND n.oid = t.relnamespace
    AND a.attnum = ANY (ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = :table_name
    AND n.nspname = :schema_name
  GROUP BY
    a.attname
`;

export default indexMapQueryPart;
