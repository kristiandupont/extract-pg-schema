// Extract comments from attributes. Used for tables, views, materialized views and composite types.

const inheritsQueryPart = `
   SELECT 
      a.attname AS column_name,
      pa.attname as parent_column_name, 
      p.relname AS parent_name
     FROM pg_class c
     JOIN pg_attribute a ON a.attrelid=c.oid
     JOIN pg_catalog.pg_inherits i ON a.attrelid=i.inhrelid
     JOIN pg_class p ON p.oid = i.inhparent
     JOIN pg_namespace p_namespace ON p.relnamespace = p_namespace.oid
     JOIN pg_attribute pa ON pa.attrelid=p.oid 
     WHERE 
      c.relname = :table_name
      AND p_namespace.nspname = :schema_name
      AND a.attnum > 0
      AND a.attname = pa.attname
`;

export default inheritsQueryPart;
