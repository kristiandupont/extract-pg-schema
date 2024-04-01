import { describe, expect, it } from "vitest";

import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import type { EnumDetails } from "./extractEnum";
import extractEnum from "./extractEnum";
import type PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"enum"> => ({
  schemaName,
  name,
  kind: "enum",
  comment: null,
});

describe("extractEnum", () => {
  const [getKnex] = useTestKnex();
  useSchema(getKnex, "test");

  it("should extract enum values", async () => {
    const db = getKnex();
    await db.raw("create type test.some_enum as enum('a', 'b', 'c')");

    const result = await extractEnum(db, makePgType("some_enum"));

    const expected: EnumDetails = {
      name: "some_enum",
      schemaName: "test",
      kind: "enum",
      comment: null,
      values: ["a", "b", "c"],
    };
    expect(result).toStrictEqual(expected);
  });
});
