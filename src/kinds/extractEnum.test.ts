import { describe, expect } from "vitest";

import { test } from "../tests/useSchema";
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
  test("it should extract enum values", async ({ knex: [db] }) => {
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
