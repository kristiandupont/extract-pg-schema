import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { describe, expect, it } from "vitest";

import extractSchemas from "./extractSchemas";
import useSchema from "./tests/useSchema";
import useTestDb from "./tests/useTestDb";

describe("extractSchemas", () => {
  const [getDb, , getConnectionConfig] = useTestDb();
  useSchema(getDb, "test_schema");

  it("should extract all schemas with default options", async () => {
    const db = getDb();
    // Set up test data
    await db.query(
      "create table test_schema.test_table (id serial primary key, name varchar(255))",
    );

    const result = await extractSchemas(getConnectionConfig());

    expect(result).toHaveProperty("test_schema");
    expect(result.test_schema.tables).toHaveLength(1);
    expect(result.test_schema.tables[0].name).toBe("test_table");
  });

  it("Issue #618 - should not filter out schemas like 'pgboss'", async () => {
    const db = getDb();
    // Set up test data
    await db.query("create schema if not exists pgboss");
    await db.query("create table pgboss.test_table (id serial primary key)");

    const result = await extractSchemas(getConnectionConfig());

    expect(result).toHaveProperty("pgboss");
    expect(result.pgboss.tables).toHaveLength(1);
    expect(result.pgboss.tables[0].name).toBe("test_table");

    await db.query("drop table if exists pgboss.test_table");
    await db.query("drop schema if exists pgboss");
  });

  // Creating a PGlite database runs initdb, which takes several seconds,
  // so this test has a longer timeout.
  it("should open a PGlite database for file: connection strings", async () => {
    const dataDir = await mkdtemp(path.join(tmpdir(), "extract-pg-schema-"));
    try {
      const pglite = new PGlite(dataDir);
      await pglite.exec(`
        create schema pglite_schema;
        create table pglite_schema.some_table (id integer, name text);
      `);
      await pglite.close();

      const result = await extractSchemas(`file:${dataDir}`, {
        schemas: ["pglite_schema"],
      });

      expect(result.pglite_schema.tables).toHaveLength(1);
      expect(result.pglite_schema.tables[0].name).toBe("some_table");
      expect(
        result.pglite_schema.tables[0].columns.map((column) => column.name),
      ).toEqual(["id", "name"]);
    } finally {
      await rm(dataDir, { recursive: true, force: true });
    }
  }, 60_000);
});
