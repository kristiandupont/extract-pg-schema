import { describe, expect, test } from "vitest";

import { createSchemaFilter, parseArgs } from "./cli";

describe("parseArgs", () => {
  test.each([
    {
      description: "help",
      args: ["--help"],
      expected: { help: true },
    },
    {
      description: "no args does not imply help",
      args: [],
      expected: {
        help: false,
        connectionConfig: {},
        includePatterns: [],
        excludePatterns: [],
      },
    },
    {
      description: "connection config",
      args: ["-h", "localhost", "-p", "5432", "-U", "user", "-d", "db"],
      expected: {
        help: false,
        connectionConfig: {
          host: "localhost",
          port: 5432,
          user: "user",
          database: "db",
        },
        includePatterns: [],
        excludePatterns: [],
      },
    },
    {
      description: "connection config with positional dbname",
      args: ["-h", "localhost", "-p", "5432", "-U", "user", "db"],
      expected: {
        help: false,
        connectionConfig: {
          host: "localhost",
          port: 5432,
          user: "user",
          database: "db",
        },
        includePatterns: [],
        excludePatterns: [],
      },
    },
    {
      description: "multiple include schemas",
      args: ["-n", "schema1", "-n", "schema2"],
      expected: {
        help: false,
        connectionConfig: {},
        includePatterns: ["schema1", "schema2"],
        excludePatterns: [],
      },
    },
    {
      description: "multiple exclude schemas",
      args: ["-n", "schema1", "-N", "schema2", "-N", "schema3"],
      expected: {
        help: false,
        connectionConfig: {},
        includePatterns: ["schema1"],
        excludePatterns: ["schema2", "schema3"],
      },
    },
  ])("it should parse args: $description", ({ args, expected }) => {
    const result = parseArgs(args);
    expect(result).toEqual(expected);
  });
});

describe("createSchemaFilter", () => {
  test.each([
    {
      description: "no include or exclude",
      include: [],
      exclude: [],
      expected: ["test", "test2", "other"],
    },
    {
      description: "include exact match",
      include: ["test"],
      exclude: [],
      expected: ["test"],
    },
    {
      description: "include pattern",
      include: ["test.*"],
      exclude: [],
      expected: ["test", "test2"],
    },
    {
      description: "exclude exact match",
      include: [],
      exclude: ["test"],
      expected: ["test2", "other"],
    },
    {
      description: "exclude pattern",
      include: [],
      exclude: ["test.*"],
      expected: ["other"],
    },
    {
      description: "include and exclude",
      include: ["test.*"],
      exclude: [".*2"],
      expected: ["test"],
    },
  ])(
    "it should filter schemas: $description",
    ({ include, exclude, expected }) => {
      const schemaFilter = createSchemaFilter(include, exclude);
      const input = ["test", "test2", "other"];
      const result = input.filter((element) => schemaFilter(element));
      expect(result).toEqual(expected);
    },
  );
});
