import { describe, expect, it } from "vitest";

import useSchema from "../tests/useSchema";
import useTestKnex from "../tests/useTestKnex";
import type { RangeDetails } from "./extractRange";
import extractRange from "./extractRange";
import type PgType from "./PgType";

const makePgType = (name: string, schemaName = "test"): PgType<"range"> => ({
  schemaName,
  name,
  kind: "range",
  comment: null,
});

describe("extractRange", () => {
  const [getKnex] = useTestKnex();
  useSchema(getKnex, "test");

  it("should extract range values", async () => {
    const db = getKnex();
    await db.raw("create type test.some_range as range(subtype=timestamptz)");

    const result = await extractRange(db, makePgType("some_range"));

    const expected: RangeDetails = {
      name: "some_range",
      schemaName: "test",
      kind: "range",
      comment: null,
      innerType: "pg_catalog.timestamptz",
    };
    expect(result).toStrictEqual(expected);
  });
});
