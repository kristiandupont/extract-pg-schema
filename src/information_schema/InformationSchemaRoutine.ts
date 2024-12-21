import type YesNo from "./YesNo";

/**
 * Information about all routines in the current database
 */
interface InformationSchemaRoutine {
  /** Name of the database containing the function (always the current database) */
  specific_catalog: string;
  /** Name of the schema containing the function */
  specific_schema: string;
  /** The "specific name" of the function that uniquely identifies it in the schema, even if overloaded */
  specific_name: string;
  /** Name of the database containing the function (always the current database) */
  routine_catalog: string;
  /** Name of the schema containing the function */
  routine_schema: string;
  /** Name of the function (might be duplicated in case of overloading) */
  routine_name: string;
  /** Always FUNCTION (In the future there might be other types of routines.) */
  routine_type: "FUNCTION";
  /** Applies to a feature not available in PostgreSQL */
  module_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  module_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  module_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  udt_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  udt_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  udt_name: string | null;
  /** Return data type of the function */
  data_type: string;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  character_maximum_length: number | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  character_octet_length: number | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  collation_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  collation_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  collation_name: string | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  numeric_precision: number | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  numeric_precision_radix: number | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  numeric_scale: number | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  datetime_precision: number | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  interval_type: string | null;
  /** Always null, since this information is not applied to return data types in PostgreSQL */
  interval_precision: string | null;
  /** Name of the database that the return data type of the function is defined in (always the current database) */
  type_udt_catalog: string | null;
  /** Name of the schema that the return data type of the function is defined in */
  type_udt_schema: string | null;
  /** Name of the return data type of the function */
  type_udt_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_name: string | null;
  /** Always null, because arrays always have unlimited maximum cardinality in PostgreSQL */
  maximum_cardinality: number | null;
  /** An identifier of the data type descriptor of the return data type of this function, unique among the data type descriptors pertaining to the function. This is mainly useful for joining with other instances of such identifiers. (The specific format of the identifier is not defined and not guaranteed to remain the same in future versions.) */
  dtd_identifier: string | null;
  /** If the function is an SQL function, then SQL, else EXTERNAL */
  routine_body: "SQL" | "EXTERNAL";
  /** The source text of the function (null if the function is not owned by a currently enabled role) */
  routine_definition: string | null;
  /** For C functions, the external name (link symbol) of the function; else null */
  external_name: string | null;
  /** The language the function is written in */
  external_language: string;
  /** Always GENERAL (The SQL standard defines other parameter styles, which are not available in PostgreSQL.) */
  parameter_style: "GENERAL";
  /** If the function is declared immutable (called deterministic in the SQL standard), then YES, else NO */
  is_deterministic: YesNo;
  /** Always MODIFIES, meaning that the function possibly modifies SQL data */
  sql_data_access: "MODIFIES";
  /** If the function automatically returns null if any of its arguments are null, then YES, else NO */
  is_null_call: YesNo;
  /** Applies to a feature not available in PostgreSQL */
  sql_path: string | null;
  /** Always YES (The opposite would be a method of a user-defined type, which is not available in PostgreSQL) */
  schema_level_routine: "YES";
  /** Applies to a feature not available in PostgreSQL */
  max_dynamic_result_sets: number;
  /** Applies to a feature not available in PostgreSQL */
  is_user_defined_cast: string | null;
  /** Applies to a feature not available in PostgreSQL */
  is_implicitly_invocable: string | null;
  /** If the function runs with the privileges of the current user, then INVOKER, if with defined user then DEFINER */
  security_type: "INVOKER" | "DEFINER";
  /** Applies to a feature not available in PostgreSQL */
  to_sql_specific_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  to_sql_specific_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  to_sql_specific_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  as_locator: string | null;
  /** Applies to a feature not available in PostgreSQL */
  created: Date | null;
  /** Applies to a feature not available in PostgreSQL */
  last_altered: Date | null;
  /** Applies to a feature not available in PostgreSQL */
  new_savepoint_level: string | null;
  /** Applies to a feature not available in PostgreSQL */
  is_udt_dependent: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_from_data_type: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_as_locator: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_char_max_length: number | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_char_octet_length: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_char_set_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_char_set_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_char_set_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_collation_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_collation_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_collation_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_numeric_precision: number | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_numeric_precision_radix: number | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_numeric_scale: number | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_datetime_precision: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_interval_type: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_interval_precision: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_type_udt_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_type_udt_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_type_udt_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_scope_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_scope_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_scope_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_maximum_cardinality: number | null;
  /** Applies to a feature not available in PostgreSQL */
  result_cast_dtd_identifier: string | null;
}

export default InformationSchemaRoutine;
