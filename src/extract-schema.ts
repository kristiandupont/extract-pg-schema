import { ConnectionConfig } from 'pg';

import extractSchemas from './extractSchemas';
import { Schema } from './types';

/** @deprecated - use extractSchemas instead */
const extractSchema = async (
  schemaName: string,
  connectionConfig: string | ConnectionConfig,
  resolveViews: boolean,
  tables?: string[]
): Promise<Schema> => {
  console.warn('NOTE: extractSchema is deprecated, use extractSchemas instead');

  const r = await extractSchemas(connectionConfig, {
    schemas: [schemaName],
    resolveViews,
  });
  return r[schemaName];
};

export default extractSchema;
