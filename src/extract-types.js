import { Knex } from 'knex'; // import type
import R from 'ramda';
import parseComment from './parseComment';

/**
 * @param {string | undefined} schemaName Name of the schema or `undefined` to
 *   extract types from all schemas.
 * @param {Knex<any, unknown[]>} db
 * @returns {Promise<import('./types').Type[]>}
 */
async function extractTypes(schemaName, db) {
  /** @type {import('./types').Type[]} */
  const types = [];
  const enumsQuery = db
    .select(['t.oid', 't.typname'])
    .from('pg_type as t')
    .join('pg_namespace as n', 'n.oid', 't.typnamespace')
    .where('t.typtype', 'e');
  if (schemaName) {
    enumsQuery.andWhere('n.nspname', schemaName);
  }
  const enumTypes = await enumsQuery;
  for (const enumType of enumTypes) {
    const typeCommentQuery = await db.schema.raw(
      `SELECT obj_description(${enumType.oid})`
    );
    const rawTypeComment =
      typeCommentQuery.rows.length > 0 &&
      typeCommentQuery.rows[0].obj_description;
    const values = await db
      .select(['enumlabel', 'enumsortorder'])
      .from('pg_enum')
      .where('enumtypid', enumType.oid);
    types.push({
      type: 'enum',
      name: enumType.typname,
      ...parseComment(rawTypeComment),
      values: R.pluck('enumlabel', R.sortBy(R.prop('enumsortorder'), values)),
    });
  }

  return types;
}

export default extractTypes;
