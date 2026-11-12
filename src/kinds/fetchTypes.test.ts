import { describe, expect, it } from "vitest";

import useSchema from "../tests/useSchema";
import useTestDb from "../tests/useTestDb";
import fetchTypes from "./fetchTypes";

describe("fetchTypes", () => {
  const [getDb] = useTestDb();
  useSchema(getDb, "test");

  it("should fetch a simple type", async () => {
    const db = getDb();
    await db.query("create table test.some_table (id integer)");

    const types = await fetchTypes(db, ["test"]);

    expect(types).toHaveLength(1);
    expect(types[0]).toEqual({
      name: "some_table",
      schemaName: "test",
      kind: "table",
      comment: null,
    });
  });

  it("should fetch all kinds", async () => {
    const db = getDb();
    await db.query("create table test.some_table (id integer)");
    await db.query("create view test.some_view as select 1 as id");
    await db.query(
      "create materialized view test.some_materialized_view as select 1 as id",
    );
    await db.query("create type test.some_composite_type as (id integer)");
    await db.query("create type test.some_enum as enum ('a', 'b')");
    await db.query("create domain test.some_domain as text");
    await db.query("create type test.some_range as range (subtype = integer)");
    await db.query(
      "create procedure test.some_procedure() language sql as $$ select 1 as id $$",
    );
    await db.query(
      "create function test.some_function() returns integer language sql as $$ select 1 as id $$",
    );
    // await db.query(
    //   "create aggregate test.some_aggregate (numeric) ( sfunc = numeric_add, stype = numeric, initcond = '0');"
    // );

    const types = await fetchTypes(db, ["test"]);
    expect(types.map((t) => [t.name, t.kind])).toEqual([
      ["some_function", "function"],
      ["some_materialized_view", "materializedView"],
      ["some_table", "table"],
      ["some_procedure", "procedure"],
      ["some_domain", "domain"],
      ["some_composite_type", "compositeType"],
      ["some_range", "range"],
      ["some_view", "view"],
      ["some_enum", "enum"],
      // ['some_multirange', 'multiRange'],
      // ['some_aggregate', 'aggregate'],
    ]);
  });

  it("should fetch comments", async () => {
    const db = getDb();

    // Tables are a "class" in postgres.
    await db.query("create table test.some_table (id integer)");
    await db.query("comment on table test.some_table is 'some table comment'");

    // Domains are "types", which is different. Make sure we get those commments as well.
    await db.query("create domain test.some_domain as text");
    await db.query(
      "comment on domain test.some_domain is 'some domain comment'",
    );

    // Composite types are both types and classes. The comment comes from the class.
    await db.query("create type test.some_composite_type as (id integer)");
    await db.query(
      "comment on type test.some_composite_type is 'some composite type comment'",
    );

    const types = await fetchTypes(db, ["test"]);
    expect(types.map((t) => [t.name, t.comment])).toEqual([
      ["some_domain", "some domain comment"],
      ["some_table", "some table comment"],
      ["some_composite_type", "some composite type comment"],
    ]);
  });
});
