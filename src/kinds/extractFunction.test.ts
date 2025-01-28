import { describe, expect, it } from "vitest";

import type InformationSchemaRoutine from "../information_schema/InformationSchemaRoutine";
import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import type { FunctionDetails } from "./extractFunction";
import extractFunction from "./extractFunction";
import type PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"function"> => ({
  schemaName,
  name,
  kind: "function",
  comment: null,
});

describe("extractFunction", () => {
  const [getKnex] = useTestKnex();
  useSchema(getKnex, "test");

  it("should extract function details", async () => {
    const db = getKnex();
    await db.raw(
      "create function test.some_function() returns text as $$ BEGIN return 'hello'; END; $$ language plpgsql",
    );

    const result = await extractFunction(db, makePgType("some_function"));

    const expected: FunctionDetails = {
      schemaName: "test",
      name: "some_function",
      kind: "function",
      comment: null,
      parameters: [],
      returnType: "text",
      language: "plpgsql",
      definition: " BEGIN return 'hello'; END; ",
      isStrict: false,
      isSecurityDefiner: false,
      isLeakProof: false,
      returnsSet: false,
      volatility: "VOLATILE",
      parallelSafety: "UNSAFE",
      estimatedCost: 100,
      estimatedRows: null,
      informationSchemaValue: {
        specific_schema: "test",
        routine_schema: "test",
        routine_name: "some_function",
        routine_type: "FUNCTION",
        module_catalog: null,
        module_schema: null,
        module_name: null,
        udt_catalog: null,
        udt_schema: null,
        udt_name: null,
        data_type: "text",
        character_maximum_length: null,
        character_octet_length: null,
        character_set_catalog: null,
        character_set_schema: null,
        character_set_name: null,
        collation_catalog: null,
        collation_schema: null,
        collation_name: null,
        numeric_precision: null,
        numeric_precision_radix: null,
        numeric_scale: null,
        datetime_precision: null,
        interval_type: null,
        interval_precision: null,
        type_udt_schema: "pg_catalog",
        type_udt_name: "text",
        scope_catalog: null,
        scope_schema: null,
        scope_name: null,
        maximum_cardinality: null,
        dtd_identifier: "0",
        routine_body: "EXTERNAL",
        routine_definition: " BEGIN return 'hello'; END; ",
        external_name: null,
        external_language: "PLPGSQL",
        parameter_style: "GENERAL",
        is_deterministic: "NO",
        sql_data_access: "MODIFIES",
        is_null_call: "NO",
        sql_path: null,
        schema_level_routine: "YES",
        max_dynamic_result_sets: 0,
        is_user_defined_cast: null,
        is_implicitly_invocable: null,
        security_type: "INVOKER",
        to_sql_specific_catalog: null,
        to_sql_specific_schema: null,
        to_sql_specific_name: null,
        as_locator: "NO",
        created: null,
        last_altered: null,
        new_savepoint_level: null,
        is_udt_dependent: "NO",
        result_cast_from_data_type: null,
        result_cast_as_locator: null,
        result_cast_char_max_length: null,
        result_cast_char_octet_length: null,
        result_cast_char_set_catalog: null,
        result_cast_char_set_schema: null,
        result_cast_char_set_name: null,
        result_cast_collation_catalog: null,
        result_cast_collation_schema: null,
        result_cast_collation_name: null,
        result_cast_numeric_precision: null,
        result_cast_numeric_precision_radix: null,
        result_cast_numeric_scale: null,
        result_cast_datetime_precision: null,
        result_cast_interval_type: null,
        result_cast_interval_precision: null,
        result_cast_type_udt_catalog: null,
        result_cast_type_udt_schema: null,
        result_cast_type_udt_name: null,
        result_cast_scope_catalog: null,
        result_cast_scope_schema: null,
        result_cast_scope_name: null,
        result_cast_maximum_cardinality: null,
        result_cast_dtd_identifier: null,
      } as InformationSchemaRoutine,
    };
    expect(result[0]).toMatchObject(expected);
  });

  it("should extract function details with arguments", async () => {
    const db = getKnex();
    await db.raw(
      "create function test.some_function(text) returns text as $$ BEGIN return $1; END; $$ language plpgsql",
    );

    const result = await extractFunction(db, makePgType("some_function"));

    const expected: Partial<FunctionDetails> = {
      schemaName: "test",
      name: "some_function",
      kind: "function",
      comment: null,
      parameters: [
        {
          name: "$1",
          type: "text",
          mode: "IN",
          hasDefault: false,
          ordinalPosition: 1,
        },
      ],
      returnType: "text",
      language: "plpgsql",
      definition: " BEGIN return $1; END; ",
    };
    expect(result[0]).toMatchObject(expected);
  });

  it("should handle different parameter modes", async () => {
    const db = getKnex();
    await db.raw(`
      create function test.param_modes(
        IN in_param text,
        OUT out_param text,
        INOUT inout_param int,
        VARIADIC var_param text[]
      ) returns record as $$
      BEGIN
        out_param := in_param;
        inout_param := inout_param * 2;
      END;
      $$ language plpgsql`);

    const result = await extractFunction(db, makePgType("param_modes"));

    expect(result[0].parameters).toMatchObject([
      { name: "in_param", mode: "IN", type: "text" },
      { name: "out_param", mode: "OUT", type: "text" },
      { name: "inout_param", mode: "INOUT", type: "integer" },
      { name: "var_param", mode: "VARIADIC", type: "text[]" },
    ]);
  });

  it("should handle complex return types", async () => {
    const db = getKnex();
    await db.raw(`
      create type test.complex_type as (id int, name text);

      create function test.returns_complex()
      returns table(
        id integer,
        name text,
        tags text[],
        metadata json,
        complex test.complex_type
      ) as $$
      BEGIN
        -- Function body
      END;
      $$ language plpgsql`);

    const result = await extractFunction(db, makePgType("returns_complex"));

    expect(result[0].returnType).toMatchObject({
      type: "table",
      columns: [
        { name: "id", type: "integer" },
        { name: "name", type: "text" },
        { name: "tags", type: "text[]" },
        { name: "metadata", type: "json" },
        { name: "complex", type: "test.complex_type" },
      ],
    });
  });

  it("should handle function attributes", async () => {
    const db = getKnex();
    await db.raw(`
      create function test.with_attributes()
      returns void
      language plpgsql
      strict
      security definer
      leakproof
      stable
      parallel safe
      cost 500
      as $$
      BEGIN
        -- Function body
      END;
      $$`);

    const result = await extractFunction(db, makePgType("with_attributes"));

    expect(result[0]).toMatchObject({
      isStrict: true,
      isSecurityDefiner: true,
      isLeakProof: true,
      volatility: "STABLE",
      parallelSafety: "SAFE",
      estimatedCost: 500,
      estimatedRows: null,
    });
  });
});
