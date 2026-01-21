import { describe, expect, it } from "vitest";

import parseViewDefinition from "./parseViewDefinition";

describe("parseViewDefinition", () => {
  it("should understand a trivial select", async () => {
    const query = `SELECT id FROM service`;

    const def = await parseViewDefinition(query, "public");
    expect(def).toEqual([
      {
        viewColumn: "id",
        source: {
          schema: "public",
          table: "service",
          column: "id",
        },
      },
    ]);
  });

  it("should understand a select with explicit schema", async () => {
    const query = `SELECT id FROM store.service`;

    const def = await parseViewDefinition(query, "public");
    expect(def).toEqual([
      {
        viewColumn: "id",
        source: {
          schema: "store",
          table: "service",
          column: "id",
        },
      },
    ]);
  });

  it("should understand a select with join", async () => {
    const query = `SELECT service.id,
    service."createdAt",
    service.name,
    "oauthConnection"."createdBy" AS owner
   FROM service
     LEFT JOIN "oauthConnection" ON service."oauthConnectionId" = "oauthConnection".id;`;

    const def = await parseViewDefinition(query, "public");
    expect(def).toEqual([
      {
        viewColumn: "id",
        source: {
          schema: "public",
          table: "service",
          column: "id",
        },
      },
      {
        viewColumn: "createdAt",
        source: {
          schema: "public",
          table: "service",
          column: "createdAt",
        },
      },
      {
        viewColumn: "name",
        source: {
          schema: "public",
          table: "service",
          column: "name",
        },
      },
      {
        viewColumn: "owner",
        source: {
          schema: "public",
          table: "oauthConnection",
          column: "createdBy",
        },
      },
    ]);
  });

  it("should work with multiple schemas and with aliases", async () => {
    const query = `
    select u.id as uid, um.id as umid 
      from test1.users u 
      join test2.user_managers um 
      on um.user_id = u.id;`;

    const def = await parseViewDefinition(query, "public");
    expect(def).toEqual([
      {
        viewColumn: "uid",
        source: {
          schema: "test1",
          table: "users",
          column: "id",
        },
      },
      {
        viewColumn: "umid",
        source: {
          schema: "test2",
          table: "user_managers",
          column: "id",
        },
      },
    ]);
  });

  it("should return undefined for unresolvable columns", async () => {
    const query = `
  SELECT cu.customer_id AS id,
    (cu.first_name::text || ' '::text) || cu.last_name::text AS name,
    a.address,
    a.postal_code AS "zip code",
    a.phone,
    city.city,
    country.country,
        CASE
            WHEN cu.activebool THEN 'active'::text
            ELSE ''::text
        END AS notes,
    cu.store_id AS sid
   FROM customer cu
     JOIN address a ON cu.address_id = a.address_id
     JOIN city ON a.city_id = city.city_id
     JOIN country ON city.country_id = country.country_id;`;

    const def = await parseViewDefinition(query, "public");
    expect(def).toEqual([
      {
        viewColumn: "id",
        source: {
          schema: "public",
          table: "customer",
          column: "customer_id",
        },
      },
      {
        viewColumn: "name",
        source: undefined,
      },
      {
        viewColumn: "address",
        source: {
          schema: "public",
          table: "address",
          column: "address",
        },
      },
      {
        viewColumn: "zip code",
        source: {
          schema: "public",
          table: "address",
          column: "postal_code",
        },
      },
      {
        viewColumn: "phone",
        source: {
          schema: "public",
          table: "address",
          column: "phone",
        },
      },
      {
        viewColumn: "city",
        source: {
          schema: "public",
          table: "city",
          column: "city",
        },
      },
      {
        viewColumn: "country",
        source: {
          schema: "public",
          table: "country",
          column: "country",
        },
      },
      {
        viewColumn: "notes",
        source: undefined,
      },
      {
        viewColumn: "sid",
        source: {
          schema: "public",
          table: "customer",
          column: "store_id",
        },
      },
    ]);
  });

  it("should work with a minimalistic WITH clause", async () => {
    const query = `
    WITH RECURSIVE hierarchy_cte AS (
      SELECT posting.date,
         account.name AS account,
         posting.amount
        FROM posting
          JOIN account ON account.id = posting.account_id
     )
    SELECT hierarchy_cte.date,
    hierarchy_cte.account,
    hierarchy_cte.amount
    FROM hierarchy_cte;
    `;

    const def = await parseViewDefinition(query, "public");

    expect(def).toEqual([
      {
        viewColumn: "date",
        source: {
          schema: "public",
          table: "posting",
          column: "date",
        },
      },
      {
        viewColumn: "account",
        source: {
          schema: "public",
          table: "account",
          column: "name",
        },
      },
      {
        viewColumn: "amount",
        source: {
          schema: "public",
          table: "posting",
          column: "amount",
        },
      },
    ]);
  });

  it("should resolve kanel#481", async () => {
    const query = `
    WITH RECURSIVE hierarchy_cte AS (
      SELECT posting.date,
         account.name AS account,
         posting.amount
        FROM posting
          JOIN account ON account.id = posting.account_id
     UNION ALL
      SELECT hierarchy_cte_1.date,
         trim_array(hierarchy_cte_1.account, 1) AS account,
         hierarchy_cte_1.amount
        FROM hierarchy_cte hierarchy_cte_1
       WHERE array_length(hierarchy_cte_1.account, 1) > 1
     )
    SELECT hierarchy_cte.date,
    hierarchy_cte.account,
    hierarchy_cte.amount
    FROM hierarchy_cte;
    `;

    const def = await parseViewDefinition(query, "public");

    expect(def).toEqual([
      {
        viewColumn: "date",
        source: {
          schema: "public",
          table: "posting",
          column: "date",
        },
      },
      {
        viewColumn: "account",
        source: {
          schema: "public",
          table: "account",
          column: "name",
        },
      },
      {
        viewColumn: "amount",
        source: {
          schema: "public",
          table: "posting",
          column: "amount",
        },
      },
    ]);
  });

  describe("nested CTEs", () => {
    it("should resolve columns through nested CTE chain and preserve schema", async () => {
      // Tests: CTE chain resolution (main SELECT -> cte_b -> cte_a -> table)
      // Also verifies schema is preserved through the chain
      const query = `
        WITH cte_a AS (
          SELECT t.id, t.name
          FROM api.source_table t
        ),
        cte_b AS (
          SELECT a.id, a.name
          FROM cte_a a
        )
        SELECT b.id, b.name
        FROM cte_b b
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "id",
          source: {
            schema: "api",
            table: "source_table",
            column: "id",
          },
        },
        {
          viewColumn: "name",
          source: {
            schema: "api",
            table: "source_table",
            column: "name",
          },
        },
      ]);
    });
  });

  describe("VALUES clause CTEs", () => {
    it("should handle VALUES-based CTE with undefined source", async () => {
      const query = `
        WITH inline_data AS (
          VALUES ('a'::text, 1::int), ('b'::text, 2::int)
        )
        SELECT column1 AS code, column2 AS value
        FROM inline_data
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "code",
          source: undefined,
        },
        {
          viewColumn: "value",
          source: undefined,
        },
      ]);
    });
  });

  describe("UNION operations", () => {
    it("should resolve different aliases per UNION branch", async () => {
      // This tests the fix for recursive CTEs where each branch has its own aliases
      // e.g., left branch uses 'rr' for roles_roles, right branch uses 'gm' for group_members
      const query = `
        WITH RECURSIVE group_members AS (
          SELECT rr.relationship, rr.parent_role_id, rr.role_id
          FROM roles_roles rr
          WHERE rr.relationship <> 'member'
          UNION ALL
          SELECT gm.relationship, gm.parent_role_id, r.id AS role_id
          FROM group_members gm
          JOIN roles_roles gr ON gr.parent_role_id = gm.role_id
          JOIN roles r ON r.id = gr.role_id
        )
        SELECT gm.relationship, gm.parent_role_id, gm.role_id
        FROM group_members gm
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "relationship",
          source: {
            schema: "public",
            table: "roles_roles",
            column: "relationship",
          },
        },
        {
          viewColumn: "parent_role_id",
          source: {
            schema: "public",
            table: "roles_roles",
            column: "parent_role_id",
          },
        },
        {
          viewColumn: "role_id",
          source: {
            schema: "public",
            table: "roles_roles",
            column: "role_id",
          },
        },
      ]);
    });

    it("should handle simple UNION ALL", async () => {
      const query = `
        SELECT a.id, a.name FROM table_a a
        UNION ALL
        SELECT b.id, b.name FROM table_b b
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "id",
          source: {
            schema: "public",
            table: "table_a",
            column: "id",
          },
        },
        {
          viewColumn: "name",
          source: {
            schema: "public",
            table: "table_a",
            column: "name",
          },
        },
        {
          viewColumn: "id",
          source: {
            schema: "public",
            table: "table_b",
            column: "id",
          },
        },
        {
          viewColumn: "name",
          source: {
            schema: "public",
            table: "table_b",
            column: "name",
          },
        },
      ]);
    });
  });

  describe("additional SQL features", () => {
    it("should handle DISTINCT ON", async () => {
      const query = `
        SELECT DISTINCT ON (t.category) t.id, t.category, t.name
        FROM items t
        ORDER BY t.category, t.created_at DESC
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "id",
          source: {
            schema: "public",
            table: "items",
            column: "id",
          },
        },
        {
          viewColumn: "category",
          source: {
            schema: "public",
            table: "items",
            column: "category",
          },
        },
        {
          viewColumn: "name",
          source: {
            schema: "public",
            table: "items",
            column: "name",
          },
        },
      ]);
    });

    it("should handle subqueries in FROM clause", async () => {
      const query = `
        SELECT sub.id, sub.total
        FROM (
          SELECT o.id, SUM(o.amount) AS total
          FROM orders o
          GROUP BY o.id
        ) sub
      `;

      const def = await parseViewDefinition(query, "public");

      expect(def).toEqual([
        {
          viewColumn: "id",
          source: {
            schema: "public",
            table: "sub",
            column: "id",
          },
        },
        {
          viewColumn: "total",
          source: {
            schema: "public",
            table: "sub",
            column: "total",
          },
        },
      ]);
    });
  });
});
