import knex, { Knex } from 'knex';

import { afterAll, beforeAll } from './fixture';
import usePostgresContainer from './usePostgresContainer';

const useTestKnex = (): readonly [() => Knex<any, any[]>, string] => {
  let knexInstance: Knex;
  const databaseName = `test_${Math.ceil(Math.random() * 1000)}`;

  const getContainer = usePostgresContainer();

  beforeAll(async () => {
    const container = getContainer();
    const connection = {
      host: container.getHost(),
      port: container.getMappedPort(5432),
      password: 'postgres',
      user: 'postgres',
    };

    const setupKnexInstance = knex({
      client: 'postgres',
      connection: { ...connection, database: 'postgres' },
    });
    await setupKnexInstance.raw('create database ??', [databaseName]);
    await setupKnexInstance.destroy();

    knexInstance = knex({
      client: 'postgres',
      connection: { ...connection, database: databaseName },
    });
  });

  afterAll(async () => {
    const container = getContainer();
    const connection = {
      host: container.getHost(),
      port: container.getMappedPort(5432),
      password: 'postgres',
      user: 'postgres',
    };

    const setupKnexInstance = knex({
      client: 'postgres',
      connection: { ...connection, database: 'postgres' },
    });

    setupKnexInstance
      .raw(`drop database ${databaseName} with (force)`)
      .then(() => setupKnexInstance.destroy());

    await knexInstance.destroy();
  });

  return [() => knexInstance, databaseName] as const;
};

export default useTestKnex;
