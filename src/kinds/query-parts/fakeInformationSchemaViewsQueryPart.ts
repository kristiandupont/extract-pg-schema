// This is a modified version of the information_schema.views definition in PostgreSQL v10.17.
// It allows materialized views to be queried.
// BEWARE: I am not sure that all of the fields return valid data.

const fakeInformationSchemaViewsQueryPart = `
  SELECT current_database()::information_schema.sql_identifier AS table_catalog,
    nc.nspname::information_schema.sql_identifier AS table_schema,
    c.relname::information_schema.sql_identifier AS table_name,
        CASE
            WHEN pg_has_role(c.relowner, 'USAGE'::text) THEN pg_get_viewdef(c.oid)
            ELSE NULL::text
        END::information_schema.character_data AS view_definition,
        CASE
            WHEN 'check_option=cascaded'::text = ANY (c.reloptions) THEN 'CASCADED'::text
            WHEN 'check_option=local'::text = ANY (c.reloptions) THEN 'LOCAL'::text
            ELSE 'NONE'::text
        END::information_schema.character_data AS check_option,
        CASE
            WHEN (pg_relation_is_updatable(c.oid::regclass, false) & 20) = 20 THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no AS is_updatable,
        CASE
            WHEN (pg_relation_is_updatable(c.oid::regclass, false) & 8) = 8 THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no AS is_insertable_into,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM pg_trigger
              WHERE pg_trigger.tgrelid = c.oid AND (pg_trigger.tgtype::integer & 81) = 81)) THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no AS is_trigger_updatable,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM pg_trigger
              WHERE pg_trigger.tgrelid = c.oid AND (pg_trigger.tgtype::integer & 73) = 73)) THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no AS is_trigger_deletable,
        CASE
            WHEN (EXISTS ( SELECT 1
               FROM pg_trigger
              WHERE pg_trigger.tgrelid = c.oid AND (pg_trigger.tgtype::integer & 69) = 69)) THEN 'YES'::text
            ELSE 'NO'::text
        END::information_schema.yes_or_no AS is_trigger_insertable_into
   FROM pg_namespace nc,
    pg_class c
  WHERE c.relnamespace = nc.oid AND c.relkind = ANY (ARRAY['v'::"char", 'm'::"char"]) AND NOT pg_is_other_temp_schema(nc.oid) AND (pg_has_role(c.relowner, 'USAGE'::text) OR has_table_privilege(c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER'::text) OR has_any_column_privilege(c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'::text))
`;

export default fakeInformationSchemaViewsQueryPart;
