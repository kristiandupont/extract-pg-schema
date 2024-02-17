import type { Knex } from "knex";

/**
 * In order to ignore the items (types, views, etc.) that belong to extensions,
 * we use these queries to figure out what the OID's of those are. We can then
 * ignore them in fetchClasses.
 * @param db Knex instance
 * @returns the oids of the Postgres extension classes and types
 */
const fetchExtensionItemIds = async (
  db: Knex,
): Promise<{
  extClassOids: number[];
  extTypeOids: number[];
  extProcOids: number[];
}> => {
  const cq = await db
    .select("c.oid")
    .from("pg_extension as e")
    .join("pg_depend as d", "d.refobjid", "e.oid")
    .join("pg_class as c", "c.oid", "d.objid")
    .join("pg_namespace as ns", "ns.oid", "e.extnamespace")
    .where("d.deptype", "e");
  const extClassOids = cq.map(({ oid }) => oid);

  const tq = await db
    .select("t.oid")
    .from("pg_extension as e")
    .join("pg_depend as d", "d.refobjid", "e.oid")
    .join("pg_type as t", "t.oid", "d.objid")
    .join("pg_namespace as ns", "ns.oid", "e.extnamespace")
    .where("d.deptype", "e");
  const extTypeOids = tq.map(({ oid }) => oid);

  const rq = await db
    .select("p.oid")
    .from("pg_extension as e")
    .join("pg_depend as d", "d.refobjid", "e.oid")
    .join("pg_proc as p", "p.oid", "d.objid")
    .join("pg_namespace as ns", "ns.oid", "e.extnamespace")
    .where("d.deptype", "e");
  const extProcOids = rq.map(({ oid }) => oid);

  return { extClassOids, extTypeOids, extProcOids };
};

export default fetchExtensionItemIds;
