import { ConnectionConfig } from 'pg';

import extractSchemas from '../extractSchemas';

const mapColumn = (column: any) => ({
  ...column,
  nullable: column.isNullable,
  rawInfo: column.informationSchemaValue,
  isPrimary: column.isPrimaryKey,
  references: column.references?.map((r: any) => ({
    ...r,
    schema: r.schemaName,
    table: r.tableName,
    column: r.columnName,
  })),
});

const mapTable = (table: any) => ({
  ...table,
  columns: table.columns.map(mapColumn),
});

/** @deprecated - use extractSchemas instead */
const extractSchema = async (
  schemaName: string,
  connectionConfig: string | ConnectionConfig,
  resolveViews: boolean,
  tables?: string[]
) => {
  console.warn('NOTE: extractSchema is deprecated, use extractSchemas instead');

  const r = await extractSchemas(connectionConfig, {
    schemas: [schemaName],
    resolveViews,
    typeFilter: (pgType) => {
      if (!['table', 'view', 'enum', 'compositeType'].includes(pgType.kind))
        return false;

      if (tables && pgType.kind === 'table') {
        return tables.includes(pgType.name);
      }
      return true;
    },
  });

  const result = {
    tables: r[schemaName].table.map(mapTable),
    views: r[schemaName].view.map(mapTable),
    types: [
      ...(r[schemaName].enum ?? []),
      ...(r[schemaName].compositeType ?? []),
    ],
  };
  return result;
};

export default extractSchema;
