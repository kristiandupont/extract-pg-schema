import YesNo from "./YesNo";

/**
 * The view tables contains all tables and views defined in the current database. Only those tables and views are shown that the current user has access to (by way of being the owner or having some privilege).
 */
interface InformationSchemaTable {
  /** Name of the database that contains the table (always the current database) */
  table_catalog: string;
  /** Name of the schema that contains the table */
  table_schema: string;
  /** Name of the table */
  table_name: string;
  /** Type of the table: BASE TABLE for a persistent base table (the normal table type), VIEW for a view, FOREIGN for a foreign table, or LOCAL TEMPORARY for a temporary table */
  table_type: "BASE TABLE" | "VIEW" | "FOREIGN" | "LOCAL TEMPORARY";
  /** Applies to a feature not available in PostgreSQL */
  self_referencing_column_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  reference_generation: string | null;
  /** If the table is a typed table, the name of the database that contains the underlying data type (always the current database), else null. */
  user_defined_type_catalog: string | null;
  /** If the table is a typed table, the name of the schema that contains the underlying data type, else null. */
  user_defined_type_schema: string | null;
  /** If the table is a typed table, the name of the underlying data type, else null. */
  user_defined_type_name: string | null;
  /** YES if the table is insertable into, NO if not (Base tables are always insertable into, views not necessarily.) */
  is_insertable_into: YesNo;
  /** YES if the table is a typed table, NO if not */
  is_typed: YesNo;
  /** Not yet implemented */
  commit_action: any;
}

export default InformationSchemaTable;
