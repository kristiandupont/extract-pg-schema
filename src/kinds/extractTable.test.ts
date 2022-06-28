import { expect, it } from 'vitest';

import { describe } from '../tests/fixture';
import useSchema from '../tests/useSchema';
import useTestKnex from '../tests/useTestKnex';
import extractTable, { TableDetails } from './extractTable';
import PgType from './PgType';

const makePgType = (
  name: string,
  schemaName: string = 'test'
): PgType<'table'> => ({
  schemaName,
  name,
  kind: 'table',
  comment: null,
});

describe('extractTable', () => {
  const getKnex = useTestKnex();
  useSchema(getKnex, 'test');

  it('should extract simplified as well as full information_schema information', async () => {
    const db = getKnex();
    await db.raw('create table test.some_table (id integer)');

    const result = await extractTable(db, makePgType('some_table'));

    const expected: TableDetails = {
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
    };

    expect(result).toStrictEqual(expected);
  });

  it('should fetch column comments', async () => {
    const db = getKnex();
    await db.raw('create table test.some_table (id integer)');
    await db.raw("comment on column test.some_table.id is 'id column'");

    const result = await extractTable(db, makePgType('some_table'));

    expect(result.columns[0].comment).toBe('id column');
  });

  it('should handle arrays of primitive types', async () => {
    const db = getKnex();
    await db.raw(
      'create table test.some_table (array_of_ints int4[], array_of_strings text[])'
    );

    const result = await extractTable(db, makePgType('some_table'));

    expect(result.columns).toMatchObject([
      {
        name: 'array_of_ints',
        type: 'int4[]',
        isArray: true,
        subType: 'int4',
      },
      {
        name: 'array_of_strings',
        type: 'text[]',
        isArray: true,
        subType: 'text',
      },
    ]);
  });

  it('should handle domains, composite types and enums as well as arrays of those', async () => {
    const db = getKnex();
    await db.raw('create domain test.some_domain as text');
    await db.raw('create type test.some_composite as (id integer, name text)');
    await db.raw("create type test.some_enum as enum ('a', 'b', 'c')");

    await db.raw(
      `create table test.some_table (
        d test.some_domain,
        c test.some_composite,
        e test.some_enum,
        d_a test.some_domain[],
        c_a test.some_composite[],
        e_a test.some_enum[]
    )`
    );

    const result = await extractTable(db, makePgType('some_table'));

    console.log(result.columns);
    expect(result.columns).toMatchObject([
      {
        name: 'd',
        domain: 'test.some_domain',
        type: 'text',
        isArray: false,
        subDomain: null,
        subType: null,
      },
      {
        name: 'c',
        domain: null,
        type: 'test.some_composite',
        isArray: false,
        subDomain: null,
        subType: null,
      },
      {
        name: 'e',
        domain: null,
        type: 'test.some_enum',
        isArray: false,
        subDomain: null,
        subType: null,
      },
      {
        name: 'd_a',
        domain: 'test.some_domain',
        type: 'text',
        isArray: false,
        subDomain: null,
        subType: null,
      },
      {
        name: 'c_a',
        domain: null,
        type: 'test.some_composite',
        isArray: false,
        subDomain: null,
        subType: null,
      },
      {
        name: 'e_a',
        domain: null,
        type: 'test.some_enum',
        isArray: false,
        subDomain: null,
        subType: null,
      },
    ]);
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
