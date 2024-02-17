export { default as extractSchema } from "./deprecatia/extract-schema";
export type { ExtractSchemaOptions, Schema } from "./extractSchemas";
export { default as extractSchemas } from "./extractSchemas";
export { type default as InformationSchemaColumn } from "./information_schema/InformationSchemaColumn";
export { type default as InformationSchemaDomain } from "./information_schema/InformationSchemaDomain";
export { type default as InformationSchemaTable } from "./information_schema/InformationSchemaTable";
export { type default as InformationSchemaView } from "./information_schema/InformationSchemaView";
export { type default as YesNo } from "./information_schema/YesNo";
export {
  type AttributeType,
  type CompositeTypeAttribute,
  type CompositeTypeDetails,
} from "./kinds/extractCompositeType";
export { type DomainDetails } from "./kinds/extractDomain";
export { type EnumDetails } from "./kinds/extractEnum";
export {
  type MaterializedViewColumn,
  type MaterializedViewColumnType,
  type MaterializedViewDetails,
} from "./kinds/extractMaterializedView";
export { type RangeDetails } from "./kinds/extractRange";
export type {
  ColumnReference,
  Index,
  TableCheck,
  TableColumn,
  TableColumnType,
  TableDetails,
  TableIndex,
  TableIndexColumn,
  TableSecurityPolicy,
  UpdateAction,
} from "./kinds/extractTable";
export { updateActionMap } from "./kinds/extractTable";
export {
  type ViewColumn,
  type ViewColumnType,
  type ViewDetails,
} from "./kinds/extractView";
export { type Kind, type default as PgType } from "./kinds/PgType";
