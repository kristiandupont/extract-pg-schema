import { afterEach, beforeEach, describe, expect, it } from "vitest";

import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import extractForeignTable from "./extractForeignTable";
import type PgType from "./PgType";

const makePgType = (
  name: string,
  schemaName = "test",
): PgType<"foreignTable"> => ({
  schemaName,
  name,
  kind: "foreignTable",
  comment: null,
});

describe("extractForeignTable", () => {
  const [getKnex, databaseName] = useTestKnex();
  useSchema(getKnex, "test");
  useSchema(getKnex, "foreign_data");

  beforeEach(async () => {
    const db = getKnex();
    await db.raw("create extension if not exists postgres_fdw");
    await db.raw(
      "create table foreign_data.dummy_table (id serial primary key, data text)",
    );
    await db.raw(
      "create server local_foreign_server foreign data wrapper postgres_fdw options (dbname 'your_test_db_name', host 'localhost')",
    );
    await db.raw(
      "create user mapping for current_user server local_foreign_server options (user 'your_user_name', password 'your_password')",
    );
    await db.raw(
      "create foreign table test.foreign_dummy_table (id integer options (column_name 'id'), data text options (column_name 'data')) server local_foreign_server options (schema_name 'foreign_data', table_name 'dummy_table')",
    );
  });

  afterEach(async () => {
    const db = getKnex();
    await db.raw("drop foreign table test.foreign_dummy_table");
    await db.raw(
      "drop user mapping for current_user server local_foreign_server",
    );
    await db.raw("drop server local_foreign_server");
    await db.raw("drop table foreign_data.dummy_table");
    await db.raw("drop extension if exists postgres_fdw");
  });

  it("should extract simplified as well as full information_schema information", async () => {
    const result = await extractForeignTable(
      getKnex(),
      makePgType("foreign_dummy_table", "test"),
    );

    const expected = {
      name: "foreign_dummy_table",
      schemaName: "test",
      kind: "foreignTable",
      comment: null,
      informationSchemaValue: {
        table_catalog: databaseName,
        table_schema: "test",
        table_name: "foreign_dummy_table",
        table_type: "FOREIGN",
        is_insertable_into: "YES",
        is_typed: "NO",
        commit_action: null,
        reference_generation: null,
        self_referencing_column_name: null,
        user_defined_type_catalog: null,
        user_defined_type_name: null,
        user_defined_type_schema: null,
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
          isUpdatable: true,
          ordinalPosition: 1,
          generated: "NEVER",
          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "foreign_dummy_table",
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
        {
          name: "data",
          expandedType: "pg_catalog.text",
          isArray: false,
          type: {
            fullName: "pg_catalog.text",
            kind: "base",
          },
          comment: null,
          maxLength: null,
          defaultValue: null,
          isIdentity: false,
          isUpdatable: true,
          ordinalPosition: 2,
          generated: "NEVER",
          informationSchemaValue: {
            table_catalog: databaseName,
            table_schema: "test",
            table_name: "foreign_dummy_table",
            column_name: "data",
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
    };

    expect(result).toStrictEqual(expected);
  });
});
