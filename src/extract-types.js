import { Knex } from 'knex'; // import type
import R from 'ramda';
import extractAttributes from './extract-attributes';
import parseComment from './parseComment';

/**
 * @param {string | undefined} schemaName Name of the schema or `undefined` to
 *   extract types from all schemas.
 * @param {Knex<any, unknown[]>} db
 * @returns {Promise<import('./types').Type[]>}
 */
async function extractTypes(schemaName, db) {
  // PG Extensions can add types to the schema. We probably don't want to
  // include those, so filter them out. Todo: should this be optional?
  const extensionTypes = await db
    .select(['t.oid'])
    .from('pg_extension as e')
    .join('pg_depend as d', 'd.refobjid', 'e.oid')
    .join('pg_type as t', 't.oid', 'd.objid')
    .join('pg_namespace as ns', 'ns.oid', 'e.extnamespace')
    .where('d.deptype', 'e');
  const extensionTypeOids = extensionTypes.map(({ oid }) => oid);

  /** @type {import('./types').Type[]} */
  const types = [];
  const enumsQuery = db
    .select(['t.oid', 't.typname'])
    .from('pg_type as t')
    .join('pg_namespace as n', 'n.oid', 't.typnamespace')
    .where('t.typtype', 'e')
    .andWhere('t.oid', 'not in', extensionTypeOids);
  if (schemaName) {
    enumsQuery.andWhere('n.nspname', schemaName);
  }
  const enumTypes = await enumsQuery;
  for (const enumType of enumTypes) {
    const rawTypeComment = await getTypeRawComment(enumType.oid, db);
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

  const compositeTypesQuery = db
    .select(['t.oid', 't.typname'])
    .from('pg_type as t')
    .join('pg_namespace as n', 'n.oid', 't.typnamespace')
    .join('pg_class as c', 'c.reltype', 't.oid')
    .where('t.typtype', 'c')
    .andWhere('c.relkind', 'c')
    .andWhere('t.oid', 'not in', extensionTypeOids);
  if (schemaName) {
    compositeTypesQuery.andWhere('n.nspname', schemaName);
  }
  const compositeTypes = await compositeTypesQuery;
  for (const compositeType of compositeTypes) {
    const rawTypeComment = await getTypeRawComment(compositeType.oid, db);
    const attributes = await extractAttributes(
      schemaName,
      compositeType.typname,
      db
    );

    types.push({
      type: 'composite',
      name: compositeType.typname,
      ...parseComment(rawTypeComment),
      attributes,
    });
  }

  return types;
}

/**
 * @param oid: number
 * @param {Knex<any, unknown[]>} db
 * @return {Promise<string|undefined>}
 */
async function getTypeRawComment(oid, db) {
  const typeCommentQuery = await db.schema.raw(
    `SELECT obj_description(${oid})`
  );
  const rawTypeComment =
    typeCommentQuery.rows.length > 0 &&
    typeCommentQuery.rows[0].obj_description;
  return rawTypeComment;
}

export default extractTypes;
