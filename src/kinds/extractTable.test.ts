import * as R from "ramda";
import { describe, expect } from "vitest";

import { test, testWith } from "../tests/useSchema";
import extractTable, {
  ColumnReference,
  TableCheck,
  TableColumn,
  TableDetails,
} from "./extractTable";
import PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"table"> => ({
  schemaName,
  name,
  kind: "table",
  comment: null,
});

// const test = testWith({ schemaNames: ['test'] });
describe("extractTable", () => {
  test("it should extract simplified as well as full information_schema information", async ({
    knex: [db, databaseName],
  }) => {
    await db.raw("create table test.some_table (id integer)");

    const result = await extractTable(db, makePgType("some_table"));

    const expected: TableDetails = {
      name: "some_table",
      schemaName: "test",
      kind: "table",
      comment: null,
      informationSchemaValue: {
        table_catalog: databaseName,
        table_schema: "test",
        table_name: "some_table",
        table_type: "BASE TABLE",
        self_referencing_column_name: null,
        reference_generation: null,
        user_defined_type_catalog: null,
        user_defined_type_schema: null,
        user_defined_type_name: null,
        is_insertable_into: "YES",
        is_typed: "NO",
        commit_action: null,
      },
      checks: [],
      columns: [
        {
          name: "id",
          expandedType: "pg_catalog.int4",
          type: { fullName: "pg_catalog.int4", kind: "base" },
          isArray: false,
          dimensions: 0,
          references: [],
          reference: null,
          defaultValue: null,
          indices: [],
          isNullable: true,
          isPrimaryKey: false,
          generated: "NEVER",
          isUpdatable: true,
          isIdentity: false,
          ordinalPosition: 1,
          maxLength: null,
          comment: null,

          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "some_table",
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
            is_updatable: "YES",
          },
        },
      ],
    };

    expect(result).toStrictEqual(expected);
  });

  test("it should fetch column comments", async ({ knex: [db] }) => {
    await db.raw("create table test.some_table (id integer)");
    await db.raw("comment on column test.some_table.id is 'id column'");

    const result = await extractTable(db, makePgType("some_table"));

    expect(result.columns[0].comment).toBe("id column");
  });

  test("it should handle arrays of primitive types", async ({ knex: [db] }) => {
    await db.raw(
      "create table test.some_table (array_of_ints integer[], array_of_strings text[], two_dimensional_array integer[][])",
    );

    const result = await extractTable(db, makePgType("some_table"));
    const actual = R.map(
      R.pick(["name", "expandedType", "type", "dimensions"]),
      result.columns,
    );

    const expected: Partial<TableColumn>[] = [
      {
        name: "array_of_ints",
        expandedType: "pg_catalog.int4[]",
        type: { fullName: "pg_catalog.int4", kind: "base" },
        dimensions: 1,
      },
      {
        name: "array_of_strings",
        expandedType: "pg_catalog.text[]",
        type: { fullName: "pg_catalog.text", kind: "base" },
        dimensions: 1,
      },
      {
        name: "two_dimensional_array",
        expandedType: "pg_catalog.int4[][]",
        type: { fullName: "pg_catalog.int4", kind: "base" },
        dimensions: 2,
      },
    ];
    expect(actual).toEqual(expected);
  });

  test("it should fetch table checks", async ({ knex: [db] }) => {
    await db.raw(`create table test.some_table_with_checks (
        id integer constraint id_check check (id > 0),
        products TEXT[],
        number_of_products INT,
        constraint products_len_check check (array_length(products, 1) = number_of_products)
    )`);

    const result = await extractTable(db, makePgType("some_table_with_checks"));
    const actual = result.checks;

    const expected: TableCheck[] = [
      { name: "id_check", clause: "id > 0" },
      {
        name: "products_len_check",
        clause: "array_length(products, 1) = number_of_products",
      },
    ];

    expect(actual).toEqual(expected);
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

    const result = await extractTable(db, makePgType("some_table"));
    const actual = R.map(
      R.pick(["name", "expandedType", "type", "dimensions"]),
      result.columns,
    );

    const expected: Partial<TableColumn>[] = [
      {
        name: "d",
        expandedType: "test.some_domain",
        type: {
          fullName: "test.some_domain",
          kind: "domain",
        },
        dimensions: 0,
      },
      {
        name: "c",
        expandedType: "test.some_composite",
        type: { fullName: "test.some_composite", kind: "composite" },
        dimensions: 0,
      },
      {
        name: "r",
        expandedType: "test.some_range",
        type: {
          fullName: "test.some_range",
          kind: "range",
        },
        dimensions: 0,
      },
      {
        name: "e",
        expandedType: "test.some_enum",
        type: { fullName: "test.some_enum", kind: "enum" },
        dimensions: 0,
      },
      {
        name: "d_a",
        expandedType: "test.some_domain[]",
        type: {
          fullName: "test.some_domain",
          kind: "domain",
        },
        dimensions: 1,
      },
      {
        name: "c_a",
        expandedType: "test.some_composite[]",
        type: { fullName: "test.some_composite", kind: "composite" },
        dimensions: 1,
      },
      {
        name: "r_a",
        expandedType: "test.some_range[]",
        type: {
          fullName: "test.some_range",
          kind: "range",
        },
        dimensions: 1,
      },
      {
        name: "e_a",
        expandedType: "test.some_enum[]",
        type: { fullName: "test.some_enum", kind: "enum" },
        dimensions: 1,
      },
    ];

    expect(actual).toEqual(expected);
  });

  describe("references", () => {
    const test = testWith({ schemaNames: ["test", "secondary_schema"] });

    test("it should extract a simple foreign key", async ({ knex: [db] }) => {
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw(
        "create table test.linking_table (some_table_id integer references test.some_table(id))",
      );

      const result = await extractTable(db, makePgType("linking_table"));

      const expected: ColumnReference = {
        schemaName: "test",
        tableName: "some_table",
        columnName: "id",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
        name: "linking_table_some_table_id_fkey",
      };
      expect(result.columns[0].references).toEqual([expected]);

      // Check that deprecated version still works:
      expect(result.columns[0].reference).toEqual(expected);
    });

    test("it should extract a foreign key with a different schema", async ({
      knex: [db],
    }) => {
      await db.raw(
        "create table secondary_schema.some_table (id integer primary key)",
      );
      await db.raw(
        "create table test.linking_table (some_table_id integer references secondary_schema.some_table(id))",
      );

      const result = await extractTable(db, makePgType("linking_table"));

      const expected: ColumnReference = {
        schemaName: "secondary_schema",
        tableName: "some_table",
        columnName: "id",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
        name: "linking_table_some_table_id_fkey",
      };
      expect(result.columns[0].references).toEqual([expected]);
    });

    test("it should get the onDelete and onUpdate actions", async ({
      knex: [db],
    }) => {
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw(
        "create table test.linking_table (some_table_id integer references test.some_table(id) on delete cascade on update set null)",
      );

      const result = await extractTable(db, makePgType("linking_table"));

      const expected: ColumnReference = {
        schemaName: "test",
        tableName: "some_table",
        columnName: "id",
        onDelete: "CASCADE",
        onUpdate: "SET NULL",
        name: "linking_table_some_table_id_fkey",
      };
      expect(result.columns[0].references).toEqual([expected]);
    });
  });

  describe("bugfixes", () => {
    test("should not report duplicate columns when a column has multiple foreign key constraints", async ({
      knex: [db],
    }) => {
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw(
        `create table test.linking_table (
          some_table_id integer,
          constraint "fk_1" foreign key ("some_table_id") references test.some_table(id),
          constraint "fk_2" foreign key ("some_table_id") references test.some_table(id)
        )`,
      );

      const result = await extractTable(db, makePgType("linking_table"));

      expect(result.columns).toHaveLength(1);

      expect(result.columns[0].references).toStrictEqual([
        {
          schemaName: "test",
          tableName: "some_table",
          columnName: "id",
          onDelete: "NO ACTION",
          onUpdate: "NO ACTION",
          name: "fk_1",
        },
        {
          schemaName: "test",
          tableName: "some_table",
          columnName: "id",
          onDelete: "NO ACTION",
          onUpdate: "NO ACTION",
          name: "fk_2",
        },
      ]);

      // Check deprecated version still works:
      expect(result.columns[0].reference).toEqual({
        schemaName: "test",
        tableName: "some_table",
        columnName: "id",
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
        name: "fk_1",
      });
    });
  });
});
