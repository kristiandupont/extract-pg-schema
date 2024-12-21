import { describe, expect, it } from "vitest";

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
      name: "some_procedure",
      schemaName: "test",
      kind: "procedure",
      comment: null,
      argumentTypes: [],
      argumentNames: [],
    };
    expect(result).toStrictEqual(expected);
  });
});
