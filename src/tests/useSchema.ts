import type { Client } from "pg";
import { afterEach, beforeEach } from "vitest";

const useSchema = (getDb: () => Client, schemaName: string): void => {
  beforeEach(async () => {
    await getDb().query(`create schema if not exists "${schemaName}"`);
  });

  afterEach(async () => {
    await getDb().query(`drop schema if exists "${schemaName}" cascade`);
  });
};

export default useSchema;
