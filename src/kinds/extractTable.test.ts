import * as R from "ramda";
import { describe, expect, it } from "vitest";

import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import type {
  ColumnReference,
  Index,
  TableCheck,
  TableColumn,
  TableDetails,
  TableIndex,
  TableSecurityPolicy,
} from "./extractTable";
import extractTable from "./extractTable";
import type PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"table"> => ({
  schemaName,
  name,
  kind: "table",
  comment: null,
});

// const test = testWith({ schemaNames: ['test'] });
describe("extractTable", () => {
  const [getKnex, databaseName] = useTestKnex();
  useSchema(getKnex, "test");

  it("should extract simplified as well as full information_schema information", async () => {
    const db = getKnex();
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
      indices: [],
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
          parentTable: null,

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
      isRowLevelSecurityEnabled: false,
      isRowLevelSecurityEnforced: false,
      securityPolicies: [],
      triggers: [],
    };

    expect(result).toStrictEqual(expected);
  });

  it("should fetch column comments", async () => {
    const db = getKnex();
    await db.raw("create table test.some_table (id integer)");
    await db.raw("comment on column test.some_table.id is 'id column'");

    const result = await extractTable(db, makePgType("some_table"));

    expect(result.columns[0].comment).toBe("id column");
  });

  it("should handle arrays of primitive types", async () => {
    const db = getKnex();
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

  it("should fetch table checks", async () => {
    const db = getKnex();
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

  it("should handle domains, composite types, ranges and enums as well as arrays of those", async () => {
    const db = getKnex();
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
    useSchema(getKnex, "secondary_schema");

    it("should extract a simple foreign key", async () => {
      const db = getKnex();
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

    it("should extract a foreign key with a different schema", async () => {
      const db = getKnex();
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

    it("should get the onDelete and onUpdate actions", async () => {
      const db = getKnex();
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

  describe("indices", () => {
    it("should extract a simple index", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw("create index some_table_id_idx on test.some_table (id)");

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_id_idx",
          isPrimary: false,
          isUnique: false,
          columns: [
            {
              name: "id",
              definition: "id",
              predicate: null,
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });

    it("should extract a unique index", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(
        "create unique index some_table_id_idx on test.some_table (id)",
      );

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_id_idx",
          isPrimary: false,
          isUnique: true,
          columns: [
            {
              name: "id",
              definition: "id",
              predicate: null,
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });

    it("it should extract a primary key", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_pkey",
          isPrimary: true,
          isUnique: true,
          columns: [
            {
              name: "id",
              definition: "id",
              predicate: null,
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });

    it("should extract a multi-column index", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer, kind integer)");
      await db.raw(
        "create index some_table_id_idx on test.some_table (id, kind)",
      );

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_id_idx",
          isPrimary: false,
          isUnique: false,
          columns: [
            {
              name: "id",
              definition: "id",
              predicate: null,
            },
            {
              name: "kind",
              definition: "kind",
              predicate: null,
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });

    it("should extract a functional index", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(
        "create index some_table_id_idx on test.some_table (abs(id))",
      );

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_id_idx",
          isPrimary: false,
          isUnique: false,
          columns: [
            {
              name: null,
              definition: "abs(id)",
              predicate: null,
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });

    it("should extract a partial index", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(
        "create index some_table_id_idx on test.some_table (id) WHERE id > 0",
      );

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableIndex[] = [
        {
          name: "some_table_id_idx",
          isPrimary: false,
          isUnique: false,
          columns: [
            {
              name: "id",
              definition: "id",
              predicate: "(id > 0)",
            },
          ],
        },
      ];

      expect(result.indices).toStrictEqual(expected);
    });
  });

  describe("row-level security", () => {
    it("should extract isRowLevelSecurityEnabled", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw("alter table test.some_table enable row level security");

      const result = await extractTable(db, makePgType("some_table"));

      expect(result.isRowLevelSecurityEnabled).toEqual(true);
      expect(result.isRowLevelSecurityEnforced).toEqual(false);
    });

    it("should extract isRowLevelSecurityEnforced", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw("alter table test.some_table force row level security");

      const result = await extractTable(db, makePgType("some_table"));

      expect(result.isRowLevelSecurityEnabled).toEqual(false);
      expect(result.isRowLevelSecurityEnforced).toEqual(true);
    });
  });

  describe("securityPolicies", () => {
    it("should extract empty array when no policy is defined", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableSecurityPolicy[] = [];
      expect(result.securityPolicies).toEqual(expected);
    });

    it("it should extract a simple security policy", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw("create policy test_policy on test.some_table");

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableSecurityPolicy[] = [
        {
          name: "test_policy",
          isPermissive: true,
          rolesAppliedTo: ["public"],
          commandType: "ALL",
          visibilityExpression: null,
          modifiabilityExpression: null,
        },
      ];
      expect(result.securityPolicies).toEqual(expected);
    });

    it("it should extract a complex security policy", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer primary key)");
      await db.raw("create role test_role");
      await db.raw(
        "create policy test_policy on test.some_table as restrictive for update to test_role, postgres using (id = 1) with check (true)",
      );

      const result = await extractTable(db, makePgType("some_table"));

      const expected: TableSecurityPolicy[] = [
        {
          name: "test_policy",
          isPermissive: false,
          rolesAppliedTo: ["postgres", "test_role"],
          commandType: "UPDATE",
          visibilityExpression: "(id = 1)",
          modifiabilityExpression: "true",
        },
      ];
      expect(result.securityPolicies).toEqual(expected);
    });
  });

  describe("bugfixes", () => {
    it("should not report duplicate columns when a column has multiple foreign key constraints", async () => {
      const db = getKnex();
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

    it("should not extract indices from another schema", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw("create index some_table_id_idx on test.some_table (id)");
      await db.raw("create schema test2");
      await db.raw("create table test2.some_table (id integer)");
      await db.raw("create index some_table_id_idx2 on test2.some_table (id)");

      const result = await extractTable(db, makePgType("some_table"));

      const expected: Index[] = [
        {
          isPrimary: false,
          name: "some_table_id_idx",
        },
      ];

      expect(result.columns[0].indices).toStrictEqual(expected);
    });
  });

  it("should extract table as well as columns that the table inherits from with inherited columns denoted with the parent table", async () => {
    const db = getKnex();
    await db.raw("CREATE TABLE test.some_base_table (base_id integer)");
    await db.raw(
      "CREATE TABLE test.some_table (child_field text) INHERITS (test.some_base_table)",
    );

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
      indices: [],
      checks: [],
      columns: [
        {
          name: "base_id",
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
          parentTable: "some_base_table",

          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "some_table",
            column_name: "base_id",
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
        {
          name: "child_field",
          expandedType: "pg_catalog.text",
          type: { fullName: "pg_catalog.text", kind: "base" },
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
          ordinalPosition: 2,
          maxLength: null,
          comment: null,
          parentTable: null,

          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "some_table",
            column_name: "child_field",
            ordinal_position: 2,
            column_default: null,
            is_nullable: "YES",
            data_type: "text",
            character_maximum_length: null,
            character_octet_length: 1073741824,
            numeric_precision: null,
            numeric_precision_radix: null,
            numeric_scale: null,
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
            udt_name: "text",
            scope_catalog: null,
            scope_schema: null,
            scope_name: null,
            maximum_cardinality: null,
            dtd_identifier: "2",
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
      isRowLevelSecurityEnabled: false,
      isRowLevelSecurityEnforced: false,
      securityPolicies: [],
      triggers: [],
    };

    expect(result).toStrictEqual(expected);
  });

  describe("triggers", () => {
    it("should extract a simple trigger on a table", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.simple_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger simple_trigger
        before insert on test.some_table
        for each row execute function test.simple_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].name).toBe("simple_trigger");
      expect(result.triggers[0].eventManipulation).toEqual(["INSERT"]);
      expect(result.triggers[0].actionTiming).toBe("BEFORE");
      expect(result.triggers[0].functionName).toBe("simple_trigger_fn");
      expect(result.triggers[0].functionSchema).toBe("test");
      expect(result.triggers[0].enabled).toBe(true);
      expect(result.triggers[0].condition).toBeNull();
      expect(result.triggers[0].orientation).toBe("ROW");
    });

    it("should extract a trigger with a WHEN condition", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.cond_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger cond_trigger
        after update on test.some_table
        for each row when (new.id > 0) execute function test.cond_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].name).toBe("cond_trigger");
      expect(result.triggers[0].eventManipulation).toEqual(["UPDATE"]);
      expect(result.triggers[0].actionTiming).toBe("AFTER");
      expect(result.triggers[0].condition).toContain("new.id > 0");
    });

    it("should extract a trigger on multiple events", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.multi_event_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger multi_event_trigger
        before insert or update or delete on test.some_table
        for each row execute function test.multi_event_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].eventManipulation.sort()).toEqual(
        ["INSERT", "UPDATE", "DELETE"].sort(),
      );
    });

    it("should extract a disabled trigger", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.disabled_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger disabled_trigger
        after insert on test.some_table
        for each row execute function test.disabled_trigger_fn();
      `);
      await db.raw(
        "alter table test.some_table disable trigger disabled_trigger",
      );

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].enabled).toBe(false);
    });

    it("should extract a trigger with a comment", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.commented_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger commented_trigger
        after insert on test.some_table
        for each row execute function test.commented_trigger_fn();
      `);
      await db.raw(
        "comment on trigger commented_trigger on test.some_table is 'This is a trigger comment.'",
      );

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].comment).toBe("This is a trigger comment.");
    });

    it("should extract a STATEMENT-level trigger", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.statement_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger statement_trigger
        after insert on test.some_table
        for each statement execute function test.statement_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].name).toBe("statement_trigger");
      expect(result.triggers[0].orientation).toBe("STATEMENT");
      expect(result.triggers[0].actionTiming).toBe("AFTER");
      expect(result.triggers[0].eventManipulation).toEqual(["INSERT"]);
    });

    it("should extract an INSTEAD OF trigger", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(
        "create view test.some_view as select * from test.some_table",
      );
      await db.raw(`
        create function test.instead_of_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger instead_of_trigger
        instead of insert on test.some_view
        for each row execute function test.instead_of_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_view"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].name).toBe("instead_of_trigger");
      expect(result.triggers[0].actionTiming).toBe("INSTEAD OF");
      expect(result.triggers[0].orientation).toBe("ROW");
      expect(result.triggers[0].eventManipulation).toEqual(["INSERT"]);
    });

    it("should extract a trigger with function arguments", async () => {
      const db = getKnex();
      await db.raw("create table test.some_table (id integer)");
      await db.raw(`
        create function test.arg_trigger_fn() returns trigger as $$
        begin
          return new;
        end;
        $$ language plpgsql;
      `);
      await db.raw(`
        create trigger arg_trigger
        before insert on test.some_table
        for each row execute function test.arg_trigger_fn();
      `);

      const result = await extractTable(db, makePgType("some_table"));
      expect(result.triggers).toHaveLength(1);
      expect(result.triggers[0].name).toBe("arg_trigger");
      expect(result.triggers[0].functionArgs).toEqual([]);
      expect(result.triggers[0].functionName).toBe("arg_trigger_fn");
    });
  });
});
