import { describe, expect, it } from "vitest";

import parseViewDefinition from "./parseViewDefinition";

describe("parseViewDefinition", () => {
  it("should understand a trivial select", () => {
    const query = `SELECT id FROM service`;

    const def = parseViewDefinition(query, "public");
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

  it("should understand a select with explicit schema", () => {
    const query = `SELECT id FROM store.service`;

    const def = parseViewDefinition(query, "public");
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

  it("should understand a select with join", () => {
    const query = `SELECT service.id,
    service."createdAt",
    service.name,
    "oauthConnection"."createdBy" AS owner
   FROM service
     LEFT JOIN "oauthConnection" ON service."oauthConnectionId" = "oauthConnection".id;`;

    const def = parseViewDefinition(query, "public");
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

  it("should work with multiple schemas and with aliases", () => {
    const query = `
    select u.id as uid, um.id as umid 
      from test1.users u 
      join test2.user_managers um 
      on um.user_id = u.id;`;

    const def = parseViewDefinition(query, "public");
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

  it("should return undefined for unresolvable columns", () => {
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

    const def = parseViewDefinition(query, "public");
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

  it("should work with a minimalistic WITH clause", () => {
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

    const def = parseViewDefinition(query, "public");

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

  it("should resolve kanel#481", () => {
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

    const def = parseViewDefinition(query, "public");

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
});
