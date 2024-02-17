import * as R from "ramda";
import { describe, expect } from "vitest";

import { test } from "../tests/useSchema";
import type { ViewColumn, ViewDetails } from "./extractView";
import extractView from "./extractView";
import type PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"view"> => ({
  schemaName,
  name,
  kind: "view",
  comment: null,
});

describe("extractView", () => {
  test("it should extract simplified as well as full information_schema information", async ({
    knex: [db, databaseName],
  }) => {
    await db.raw("create view test.some_view as select 1 as id");

    const result = await extractView(db, makePgType("some_view"));

    const expected: ViewDetails = {
      name: "some_view",
      schemaName: "test",
      kind: "view",
      comment: null,
      definition: " SELECT 1 AS id;",
      informationSchemaValue: {
        table_catalog: databaseName,
        table_schema: "test",
        table_name: "some_view",
        view_definition: " SELECT 1 AS id;",
        check_option: "NONE",
        is_updatable: "NO",
        is_insertable_into: "NO",
        is_trigger_updatable: "NO",
        is_trigger_deletable: "NO",
        is_trigger_insertable_into: "NO",
      },
      columns: [
        {
          name: "id",
          expandedType: "pg_catalog.int4",
          isArray: false,
          type: {
            fullName: "pg_catalog.int4",
            kind: "base",
          },
          comment: null,
          maxLength: null,
          defaultValue: null,
          isIdentity: false,
          isUpdatable: false,
          ordinalPosition: 1,
          generated: "NEVER",
          source: null,
          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "some_view",
            column_name: "id",
            ordinal_position: 1,
            column_default: null,
            is_nullable: "YES",
            data_type: "integer",
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
            udt_schema: "pg_catalog",
            udt_name: "int4",
            scope_catalog: null,
            scope_schema: null,
            scope_name: null,
            maximum_cardinality: null,
            dtd_identifier: "1",
            is_self_referencing: "NO",
            is_identity: "NO",
            identity_generation: null,
            identity_start: null,
            identity_increment: null,
            identity_maximum: null,
            identity_minimum: null,
            identity_cycle: "NO",
            is_generated: "NEVER",
            generation_expression: null,
            is_updatable: "NO",
          },
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  test("it should fetch column comments", async ({ knex: [db] }) => {
    await db.raw("create view test.some_view as select 1 as id");
    await db.raw("comment on column test.some_view.id is 'id column'");

    const result = await extractView(db, makePgType("some_view"));

    expect(result.columns[0].comment).toBe("id column");
  });

  test("it should handle domains, composite types, ranges and enums as well as arrays of those", async ({
    knex: [db],
  }) => {
    await db.raw("create domain test.some_domain as text");
    await db.raw("create type test.some_composite as (id integer, name text)");
    await db.raw("create type test.some_range as range(subtype=timestamptz)");
    await db.raw("create type test.some_enum as enum ('a', 'b', 'c')");

    await db.raw(
      `create table test.some_table (
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

    await db.raw("create view test.some_view as select * from test.some_table");

    const result = await extractView(db, makePgType("some_view"));
    const actual = R.map(
      R.pick(["name", "expandedType", "type", "isArray"]),
      result.columns,
    );

    const expected: Partial<ViewColumn>[] = [
      {
        name: "d",
        expandedType: "test.some_domain",
        type: {
          fullName: "test.some_domain",
          kind: "domain",
        },
        isArray: false,
      },
      {
        name: "c",
        expandedType: "test.some_composite",
        type: { fullName: "test.some_composite", kind: "composite" },
        isArray: false,
      },
      {
        name: "r",
        expandedType: "test.some_range",
        type: {
          fullName: "test.some_range",
          kind: "range",
        },
        isArray: false,
      },
      {
        name: "e",
        expandedType: "test.some_enum",
        type: { fullName: "test.some_enum", kind: "enum" },
        isArray: false,
      },
      {
        name: "d_a",
        expandedType: "test.some_domain[]",
        type: {
          fullName: "test.some_domain",
          kind: "domain",
        },
        isArray: true,
      },
      {
        name: "c_a",
        expandedType: "test.some_composite[]",
        type: { fullName: "test.some_composite", kind: "composite" },
        isArray: true,
      },
      {
        name: "r_a",
        expandedType: "test.some_range[]",
        type: {
          fullName: "test.some_range",
          kind: "range",
        },
        isArray: true,
      },
      {
        name: "e_a",
        expandedType: "test.some_enum[]",
        type: { fullName: "test.some_enum", kind: "enum" },
        isArray: true,
      },
    ];

    expect(actual).toEqual(expected);
  });

  test("it should report the correct source", async ({ knex: [db] }) => {
    await db.raw("create table test.some_table (id integer not null)");
    await db.raw("create view test.some_view as select * from test.some_table");

    const result = await extractView(db, makePgType("some_view"));

    expect(result.columns[0].type.fullName).toBe("pg_catalog.int4");
    expect(result.columns[0].source).toEqual({
      schema: "test",
      table: "some_table",
      column: "id",
    });
  });
});
