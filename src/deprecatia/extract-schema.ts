import { ConnectionConfig } from "pg";
import * as R from "ramda";
import { parse } from "tagged-comment-parser";

import extractSchemas from "../extractSchemas";

const tryParse = (str: string) => {
  try {
    return parse(str);
  } catch (e) {
    return { comment: str || undefined, tags: {} };
  }
};

const mapColumn = (column: any) => {
  const {
    // These have just been renamed:
    isNullable: nullable,
    informationSchemaValue: rawInfo,
    isPrimaryKey: isPrimary,

    // These have changed:
    reference,
    expandedType,
    comment: rawComment,

    // And these didn't exist before:
    ordinalPosition: _ordinalPosition,
    type: _type,
    dimensions: _dimensions,

    // Everything else should be as it was
    ...rest
  } = column;

  const { comment, tags } = tryParse(rawComment);

  const typeName = expandedType.split(".")[1];
  return {
    ...rest,
    comment,
    tags,
    nullable,
    rawInfo,
    isPrimary,
    type: typeName,
    subType: typeName,
    reference:
      (reference && {
        schema: reference.schemaName,
        table: reference.tableName,
        column: reference.columnName,
        onUpdate: reference.onUpdate,
        onDelete: reference.onDelete,
      }) ||
      undefined,
  };
};

const mapTable = (table: any) => {
  const {
    columns,
    comment: rawComment,

    informationSchemaValue: _informationSchemaValue,
    definition: _definition,
    kind: _kind,
    schemaName: _schemaName,

    ...rest
  } = table;

  const { comment, tags } = tryParse(rawComment);

  return {
    ...rest,
    comment,
    tags,
    columns: columns.map(mapColumn),
  };
};

const mapType = (type: any) => {
  const { comment: rawComment, kind, schemaName: _schemaName, ...rest } = type;

  const { comment, tags } = tryParse(rawComment);

  return {
    ...rest,
    type: kind, // this just happens to match the old types..
    comment,
    tags,
  };
};

/** @deprecated - use extractSchemas instead */
const extractSchema = async (
  schemaName: string,
  connectionConfig: string | ConnectionConfig,
  resolveViews: boolean,
  tables?: string[],
): Promise<{
  tables: any[];
  views: any[];
  types: any[];
}> => {
  console.warn("NOTE: extractSchema is deprecated, use extractSchemas instead");

  const r = await extractSchemas(connectionConfig, {
    schemas: [schemaName],
    resolveViews,
    typeFilter: (pgType) => {
      if (!["table", "view", "enum", "compositeType"].includes(pgType.kind))
        return false;

      if (tables && pgType.kind === "table") {
        return tables.includes(pgType.name);
      }
      return true;
    },
  });

  const result = {
    tables: R.sortBy(R.prop("name"), r[schemaName].tables.map(mapTable)),
    views: R.sortBy(R.prop("name"), r[schemaName].views.map(mapTable)),
    types: R.sortBy(
      R.prop("name"),
      [
        ...(r[schemaName].enums ?? []),
        ...(r[schemaName].compositeTypes ?? []),
      ].map(mapType),
    ),
  };
  return result;
};

export default extractSchema;
