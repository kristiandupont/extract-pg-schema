import type YesNo from "./YesNo";

/**
 * The view tables contains all tables and views defined in the current database. Only those tables and views are shown that the current user has access to (by way of being the owner or having some privilege).
 */
interface InformationSchemaView {
  /** Name of the database that contains the table (always the current database) */
  table_catalog: string;
  /** Name of the schema that contains the table */
  table_schema: string;
  /** Name of the table */
  table_name: string;
  /** Query expression defining the view (null if the view is not owned by a currently enabled role) */
  view_definition: string;
  /** CASCADED or LOCAL if the view has a CHECK OPTION defined on it, NONE if not */
  check_option: "CASCADED" | "LOCAL" | "NONE";
  /** ES if the view is updatable (allows UPDATE and DELETE), NO if not */
  is_updatable: YesNo;
  /** YES if the table is insertable into, NO if not (Base tables are always insertable into, views not necessarily.) */
  is_insertable_into: YesNo;
  /** YES if the view has an INSTEAD OF UPDATE trigger defined on it, NO if not */
  is_trigger_updatable: YesNo;
  /** YES if the view has an INSTEAD OF DELETE trigger defined on it, NO if not */
  is_trigger_deletable: YesNo;
  /** YES if the view has an INSTEAD OF INSERT trigger defined on it, NO if not */
  is_trigger_insertable_into: YesNo;
}

export default InformationSchemaView;
