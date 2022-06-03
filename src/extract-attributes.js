import * as R from 'ramda';

import parseComment from './parse-comment';

/**
 * @typedef {{ name: string, maxLength: number, nullable: boolean, defaultValue: any, type: string, comment: string, tags: TagMap, rawInfo: object }} Attribute
 */

/**
 * @param {string} schemaName
 * @param {string} typeName
 * @param {import('knex').Knex<any, unknown[]>} db
 * @returns {Promise<Attribute[]>}
 */
async function extractAttributes(schemaName, typeName, db) {
  const dbAttributes = await db
    .select(
      db.raw(
        `*, ('"' || "attribute_udt_schema" || '"."' || "attribute_udt_name" || '"')::regtype as regtype`
      )
    )
    .from('information_schema.attributes')
    .where('udt_schema', schemaName)
    .where('udt_name', typeName);

  const commentsQuery = await db.schema.raw(`
      SELECT cols.attribute_name, pg_catalog.col_description(c.oid, cols.ordinal_position::int)
      FROM pg_catalog.pg_class c, information_schema.attributes cols
      WHERE cols.udt_schema = '${schemaName}' AND cols.udt_name = '${typeName}' AND cols.udt_name = c.relname;
    `);
  const commentMap = R.pluck(
    'col_description',
    R.indexBy(R.prop('attribute_name'), commentsQuery.rows)
  );

  const attributes = R.map(
    /** @returns {Attribute} */
    (attribute) => ({
      name: attribute.attribute_name,
      maxLength: attribute.character_maximum_length,
      nullable: attribute.is_nullable === 'YES',
      defaultValue: attribute.attribute_default,
      type:
        attribute.data_type === 'ARRAY'
          ? attribute.regtype
          : attribute.attribute_udt_name,
      ...parseComment(commentMap[attribute.attribute_name]),
      rawInfo: attribute,
    }),
    dbAttributes
  );

  return attributes;
}

export default extractAttributes;
