/**
 * The subset of a database client that this library uses. Both `pg.Client`
 * and PGlite match it.
 */
export interface DbConnection {
  query(text: string, values?: unknown[]): Promise<{ rows: any[] }>;
}

// Matches `:name`, but not the second colon of a `::type` cast.
const namedParameter = /(?<!:):(\w+)/g;

/**
 * Runs a query with named parameters. Each `:name` in `text` where `name` is
 * a key of `params` is replaced by a positional `$n` parameter. Other
 * occurrences (such as `::text` casts) are left unchanged.
 * @param db The connection to run the query on.
 * @param text The SQL text.
 * @param params Values for the named parameters.
 * @returns The rows returned by the query.
 */
export const query = async <T = any>(
  db: DbConnection,
  text: string,
  params: Record<string, unknown> = {},
): Promise<T[]> => {
  const values: unknown[] = [];
  const positionalText = text.replace(namedParameter, (match, name) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) {
      return match;
    }
    values.push(params[name]);
    return `$${values.length}`;
  });
  const result = await db.query(positionalText, values);
  return result.rows;
};
