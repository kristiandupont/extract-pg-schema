import { describe, expect, it } from "vitest";

import extractSchemas from "./extractSchemas";
import useSchema from "./tests/useSchema";
import useTestKnex from "./tests/useTestKnex";

describe("extractSchemas", () => {
  const [getKnex] = useTestKnex();
  useSchema(getKnex, "test_schema");

  it("should extract all schemas with default options", async () => {
    const db = getKnex();
    // Set up test data
    await db.schema
      .withSchema("test_schema")
      .createTableIfNotExists("test_table", (table) => {
        table.increments("id");
        table.string("name");
      });

    const connection = db.client.config.connection;
    const result = await extractSchemas(connection);

    expect(result).toHaveProperty("test_schema");
    expect(result.test_schema.tables).toHaveLength(1);
    expect(result.test_schema.tables[0].name).toBe("test_table");
  });

  it("Issue #618 - should not filter out schemas like 'pgboss'", async () => {
    const db = getKnex();
    // Set up test data
    await db.schema.createSchemaIfNotExists("pgboss");
    await db.schema
      .withSchema("pgboss")
      .createTableIfNotExists("test_table", (table) => table.increments("id"));

    const connection = db.client.config.connection;
    const result = await extractSchemas(connection);

    expect(result).toHaveProperty("pgboss");
    expect(result.pgboss.tables).toHaveLength(1);
    expect(result.pgboss.tables[0].name).toBe("test_table");

    await db.schema.dropTableIfExists("pgboss.test_table");
    await db.schema.dropSchemaIfExists("pgboss");
  });
});
