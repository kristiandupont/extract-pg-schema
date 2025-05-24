// Information schema type for triggers, based on PostgreSQL documentation

export interface InformationSchemaTrigger {
  trigger_catalog: string;
  trigger_schema: string;
  trigger_name: string;
  event_manipulation: "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE";
  event_object_catalog: string;
  event_object_schema: string;
  event_object_table: string;
  action_order: number | null;
  action_condition: string | null;
  action_statement: string;
  action_orientation: "ROW" | "STATEMENT";
  action_timing: "BEFORE" | "AFTER" | "INSTEAD OF";
  action_reference_old_table: string | null;
  action_reference_new_table: string | null;
  action_reference_old_row: string | null;
  action_reference_new_row: string | null;
  created: string | null;
}
