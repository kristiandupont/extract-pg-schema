import { Client, type ClientConfig } from "pg";
import { afterAll, beforeAll } from "vitest";

import usePostgresContainer from "./usePostgresContainer";

/**
 * Creates a fresh database in the test container for the current test file.
 * @returns A function that returns a client connected to the database, the
 * database name, and a function that returns the connection config.
 */
const useTestDb = (): readonly [() => Client, string, () => ClientConfig] => {
  let client: Client;
  let connectionConfig: ClientConfig;
  const databaseName = `test_${Math.ceil(Math.random() * 1000)}`;

  const getContainer = usePostgresContainer();

  const getServerConfig = (): ClientConfig => {
    const container = getContainer();
    return {
      host: container.getHost(),
      port: container.getMappedPort(5432),
      password: "postgres",
      user: "postgres",
    };
  };

  const runOnServer = async (sql: string): Promise<void> => {
    const setupClient = new Client({
      ...getServerConfig(),
      database: "postgres",
    });
    await setupClient.connect();
    try {
      await setupClient.query(sql);
    } finally {
      await setupClient.end();
    }
  };

  beforeAll(async () => {
    await runOnServer(`create database "${databaseName}"`);

    connectionConfig = { ...getServerConfig(), database: databaseName };
    client = new Client(connectionConfig);
    await client.connect();
  });

  afterAll(async () => {
    await client.end();
    await runOnServer(`drop database "${databaseName}" with (force)`);
  });

  return [() => client, databaseName, () => connectionConfig] as const;
};

export default useTestDb;
