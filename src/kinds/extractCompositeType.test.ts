import * as R from 'ramda';
import { describe, expect } from 'vitest';

import { test } from '../tests/useSchema';
import extractCompositeType, {
  CompositeTypeAttribute,
  CompositeTypeDetails,
} from './extractCompositeType';
import PgType from './PgType';

const makePgType = (
  name: string,
  schemaName = 'test',
): PgType<'compositeType'> => ({
  schemaName,
  name,
  kind: 'compositeType',
  comment: null,
});

describe('extractCompositeType', () => {
  test('it should extract simplified information', async ({
    knex: [db, databaseName],
  }) => {
    await db.raw('create type test.some_composite_type as (id integer)');

    const result = await extractCompositeType(
      db,
      makePgType('some_composite_type'),
    );

    const expected: CompositeTypeDetails = {
      name: 'some_composite_type',
      schemaName: 'test',
      kind: 'compositeType',
      comment: null,
      attributes: [
        {
          name: 'id',
          expandedType: 'pg_catalog.int4',
          isArray: false,
          type: {
            fullName: 'pg_catalog.int4',
            kind: 'base',
          },
          comment: null,
          maxLength: null,
          defaultValue: null,
          isNullable: true,
          isIdentity: false,
          isUpdatable: false,
          ordinalPosition: 1,
          generated: 'NEVER',
          fakeInformationSchemaValue: {
            table_catalog: databaseName,
            table_schema: 'test',
            table_name: 'some_composite_type',
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
            udt_catalog: databaseName,
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
            is_updatable: 'NO',
          },
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  test('it should fetch column comments', async ({ knex: [db] }) => {
    await db.raw(
      'create type test.some_composite_type as (id integer, name text)',
    );
    await db.raw(
      "comment on column test.some_composite_type.id is 'id column'",
    );

    const result = await extractCompositeType(
      db,
      makePgType('some_composite_type'),
    );

    expect(result.attributes[0].comment).toBe('id column');
  });

  test('it should handle domains, composite types, ranges and enums as well as arrays of those', async ({
    knex: [db],
  }) => {
    await db.raw('create domain test.some_domain as text');
    await db.raw('create type test.some_composite as (id integer, name text)');
    await db.raw('create type test.some_range as range(subtype=timestamptz)');
    await db.raw("create type test.some_enum as enum ('a', 'b', 'c')");

    await db.raw(
      `create type test.some_composite_type as (
        d test.some_domain,
        c test.some_composite,
        r test.some_range,
        e test.some_enum,
        d_a test.some_domain[],
        c_a test.some_composite[],
        r_a test.some_range[],
        e_a test.some_enum[]
    )`,
    );

    const result = await extractCompositeType(
      db,
      makePgType('some_composite_type'),
    );
    const actual = R.map(
      R.pick(['name', 'expandedType', 'type', 'isArray']),
      result.attributes,
    );

    const expected: Partial<CompositeTypeAttribute>[] = [
      {
        name: 'd',
        expandedType: 'test.some_domain',
        type: {
          fullName: 'test.some_domain',
          kind: 'domain',
        },
        isArray: false,
      },
      {
        name: 'c',
        expandedType: 'test.some_composite',
        type: { fullName: 'test.some_composite', kind: 'composite' },
        isArray: false,
      },
      {
        name: 'r',
        expandedType: 'test.some_range',
        type: {
          fullName: 'test.some_range',
          kind: 'range',
        },
        isArray: false,
      },
      {
        name: 'e',
        expandedType: 'test.some_enum',
        type: { fullName: 'test.some_enum', kind: 'enum' },
        isArray: false,
      },
      {
        name: 'd_a',
        expandedType: 'test.some_domain[]',
        type: {
          fullName: 'test.some_domain',
          kind: 'domain',
        },
        isArray: true,
      },
      {
        name: 'c_a',
        expandedType: 'test.some_composite[]',
        type: { fullName: 'test.some_composite', kind: 'composite' },
        isArray: true,
      },
      {
        name: 'r_a',
        expandedType: 'test.some_range[]',
        type: {
          fullName: 'test.some_range',
          kind: 'range',
        },
        isArray: true,
      },
      {
        name: 'e_a',
        expandedType: 'test.some_enum[]',
        type: { fullName: 'test.some_enum', kind: 'enum' },
        isArray: true,
      },
    ];

    expect(actual).toEqual(expected);
  });
});
