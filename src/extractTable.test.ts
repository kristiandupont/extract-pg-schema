import { expect, it } from 'vitest';

import extractTable from './extractTable';
import { Kind, PgType } from './fetchTypes';
import { describe } from './tests/fixture';
import useSchema from './tests/useSchema';
import useTestKnex from './tests/useTestKnex';

const makePgType = (
  name: string,
  schemaName: string = 'test',
  kind: Kind = 'table'
): PgType => ({
  schemaName,
  kind,
  name,
  comment: null,
});

describe('extractTable', () => {
  const getKnex = useTestKnex();
  useSchema(getKnex, 'test');

  it('should extract simplified as well as full information_schema information', async () => {
    const db = getKnex();
    await db.raw('create table test.some_table (id integer)');

    const result = await extractTable(db, makePgType('some_table'));

    expect(result).toEqual({
      informationSchemaValue: {
        table_catalog: 'postgres',
        table_schema: 'test',
        table_name: 'some_table',
        table_type: 'BASE TABLE',
        self_referencing_column_name: null,
        reference_generation: null,
        user_defined_type_catalog: null,
        user_defined_type_schema: null,
        user_defined_type_name: null,
        is_insertable_into: 'YES',
        is_typed: 'NO',
        commit_action: null,
      },
      columns: [
        {
          name: 'id',
          type: 'int4',
          isArray: false,
          reference: null,
          defaultValue: null,
          indices: [],
          isNullable: true,
          isPrimaryKey: false,
          generated: 'NEVER',
          isUpdatable: true,
          isIdentity: false,
          ordinalPosition: 1,
          maxLength: null,
          subType: 'int4',

          informationSchemaValue: {
            table_catalog: 'postgres',
            table_schema: 'test',
            table_name: 'some_table',
            column_name: 'id',
            ordinal_position: 1,
            column_default: null,
            is_nullable: 'YES',
            data_type: 'integer',
            character_maximum_length: null,
            character_octet_length: null,
            numeric_precision: 32,
            numeric_precision_radix: 2,
            numeric_scale: 0,
            datetime_precision: null,
            interval_type: null,
            interval_precision: null,
            character_set_catalog: null,
            character_set_schema: null,
            character_set_name: null,
            collation_catalog: null,
            collation_schema: null,
            collation_name: null,
            domain_catalog: null,
            domain_schema: null,
            domain_name: null,
            udt_catalog: 'postgres',
            udt_schema: 'pg_catalog',
            udt_name: 'int4',
            scope_catalog: null,
            scope_schema: null,
            scope_name: null,
            maximum_cardinality: null,
            dtd_identifier: '1',
            is_self_referencing: 'NO',
            is_identity: 'NO',
            identity_generation: null,
            identity_start: null,
            identity_increment: null,
            identity_maximum: null,
            identity_minimum: null,
            identity_cycle: 'NO',
            is_generated: 'NEVER',
            generation_expression: null,
            is_updatable: 'YES',
          },
        },
      ],
    });
  });

  it('should handle arrays', async () => {
    const db = getKnex();
    await db.raw('create table test.some_table (id integer[])');

    const result = await extractTable(db, makePgType('some_table'));

    expect(result.columns[0]).toEqual({
      name: 'id',
      type: 'int4[]',
      isArray: true,
      reference: null,
      defaultValue: null,
      indices: [],
      isNullable: true,
      isPrimaryKey: false,
      generated: 'NEVER',
      isUpdatable: true,
      isIdentity: false,
      ordinalPosition: 1,
      maxLength: null,
      subType: 'int4',
    });
  });

  describe('references', () => {
    useSchema(getKnex, 'secondary_schema');

    it('should extract a simple foreign key', async () => {
      const db = getKnex();

      await db.raw('create table test.some_table (id int4 primary key)');
      await db.raw(
        'create table test.linking_table (some_table_id int4 references test.some_table(id))'
      );

      const result = await extractTable(db, makePgType('linking_table'));

      expect(result.columns[0].reference).toEqual({
        schema: 'test',
        table: 'some_table',
        column: 'id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      });
    });

    it('should extract a foreign key with a different schema', async () => {
      const db = getKnex();

      await db.raw(
        'create table secondary_schema.some_table (id int4 primary key)'
      );
      await db.raw(
        'create table test.linking_table (some_table_id int4 references secondary_schema.some_table(id))'
      );

      const result = await extractTable(db, makePgType('linking_table'));

      expect(result.columns[0].reference).toEqual({
        schema: 'secondary_schema',
        table: 'some_table',
        column: 'id',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      });
    });

    it('should get the onDelete and onUpdate actions', async () => {
      const db = getKnex();

      await db.raw('create table test.some_table (id int4 primary key)');
      await db.raw(
        'create table test.linking_table (some_table_id int4 references test.some_table(id) on delete cascade on update set null)'
      );

      const result = await extractTable(db, makePgType('linking_table'));

      expect(result.columns[0].reference).toEqual({
        schema: 'test',
        table: 'some_table',
        column: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'SET NULL',
      });
    });
  });
});
