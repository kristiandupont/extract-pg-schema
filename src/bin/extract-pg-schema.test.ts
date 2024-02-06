import { describe, expect, test } from "vitest";

import { createSchemaFilter } from "./extract-pg-schema";

describe("createSchemaFilter", () => {
  test.each([
    {
      include: [],
      exclude: [],
      expected: ["test", "test2", "other"],
    },
    {
      include: ["test"],
      exclude: [],
      expected: ["test"],
    },
    {
      include: ["test.*"],
      exclude: [],
      expected: ["test", "test2"],
    },
    {
      include: [],
      exclude: ["test"],
      expected: ["test2", "other"],
    },
    {
      include: [],
      exclude: ["test.*"],
      expected: ["other"],
    },
    {
      include: ["test.*"],
      exclude: [".*2"],
      expected: ["test"],
    },
  ])(
    "it should filter schemas. include: $include, exclude: $exclude",
    ({ include, exclude, expected }) => {
      const schemaFilter = createSchemaFilter(include, exclude);
      const input = ["test", "test2", "other"];
      const result = input.filter((element) => schemaFilter(element));
      expect(result).toEqual(expected);
    },
  );
});
