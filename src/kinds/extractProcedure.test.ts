import { describe, expect, it } from "vitest";

import type InformationSchemaRoutine from "../information_schema/InformationSchemaRoutine";
import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import type { ProcedureDetails } from "./extractProcedure";
import extractProcedure from "./extractProcedure";
import type PgType from "./PgType";

const makePgType = (
  name: string,
  schemaName = "test",
): PgType<"procedure"> => ({
  schemaName,
  name,
  kind: "procedure",
  comment: null,
});

describe("extractProcedure", () => {
  const [getKnex] = useTestKnex();
  useSchema(getKnex, "test");

  it("should extract procedure details", async () => {
    const db = getKnex();
    await db.raw(
      "create procedure test.some_procedure() as $$ begin end $$ language plpgsql",
    );

    const result = await extractProcedure(db, makePgType("some_procedure"));

    const expected: ProcedureDetails = {
      schemaName: "test",
      name: "some_procedure",
      kind: "procedure",
      comment: null,
      parameters: [],
      language: "plpgsql",
      definition: " begin end ",
      isSecurityDefiner: false,
      isLeakProof: false,
      parallelSafety: "UNSAFE",
      estimatedCost: 100,
      informationSchemaValue: {
        specific_schema: "test",
        routine_schema: "test",
        routine_name: "some_procedure",
        routine_type: "PROCEDURE",
        module_catalog: null,
        module_schema: null,
        module_name: null,
        udt_catalog: null,
        udt_schema: null,
        udt_name: null,
        data_type: null,
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
        type_udt_catalog: null,
        type_udt_schema: null,
        type_udt_name: null,
        scope_catalog: null,
        scope_schema: null,
        scope_name: null,
        maximum_cardinality: null,
        dtd_identifier: null,
        routine_body: "EXTERNAL",
        routine_definition: " begin end ",
        external_name: null,
        external_language: "PLPGSQL",
        parameter_style: "GENERAL",
        is_deterministic: "NO",
        sql_data_access: "MODIFIES",
        is_null_call: null,
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
    expect(result).toMatchObject(expected);
  });

  it("should extract procedure details with parameters", async () => {
    const db = getKnex();
    await db.raw(`
      CREATE PROCEDURE test.some_procedure(
        IN in_param text,
        OUT out_param text,
        INOUT inout_param int
      ) 
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        out_param := in_param;
        inout_param := inout_param * 2;
      END;
      $$`);

    const result = await extractProcedure(db, makePgType("some_procedure"));

    expect(result).toMatchObject({
      name: "some_procedure",
      schemaName: "test",
      kind: "procedure",
      parameters: [
        { name: "in_param", mode: "IN", type: "text" },
        { name: "out_param", mode: "OUT", type: "text" },
        { name: "inout_param", mode: "INOUT", type: "integer" },
      ],
      language: "plpgsql",
      isSecurityDefiner: true,
    });
  });
});
