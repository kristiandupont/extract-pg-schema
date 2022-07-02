import { ConnectionConfig } from 'pg';

import extractSchemas from '../extractSchemas';

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
  });
  const result = {
    tables: r[schemaName].table,
    views: r[schemaName].view,
    types: [
      ...(r[schemaName].enum ?? []),
      ...(r[schemaName].compositeType ?? []),
    ],
  };
  return result;
};

export default extractSchema;
