import { type DbConnection, query } from "./db";

/**
 * In order to ignore the items (types, views, etc.) that belong to extensions,
 * we use these queries to figure out what the OID's of those are. We can then
 * ignore them in fetchClasses.
 * @param db Database connection
 * @returns the oids of the Postgres extension classes and types
 */
const fetchExtensionItemIds = async (
  db: DbConnection,
): Promise<{
  extClassOids: number[];
  extTypeOids: number[];
  extProcOids: number[];
}> => {
  const fetchOids = async (catalog: string): Promise<number[]> => {
    const rows = await query<{ oid: number }>(
      db,
      `
      SELECT x.oid
      FROM pg_extension e
      JOIN pg_depend d ON d.refobjid = e.oid
      JOIN ${catalog} x ON x.oid = d.objid
      JOIN pg_namespace ns ON ns.oid = e.extnamespace
      WHERE d.deptype = 'e'
      `,
    );
    return rows.map(({ oid }) => oid);
  };

  const extClassOids = await fetchOids("pg_class");
  const extTypeOids = await fetchOids("pg_type");
  const extProcOids = await fetchOids("pg_proc");

  return { extClassOids, extTypeOids, extProcOids };
};

export default fetchExtensionItemIds;
