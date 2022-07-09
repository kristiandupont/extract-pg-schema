import knex, { Knex } from 'knex';

import { test as base } from './usePostgresContainer';

export const test = base.extend<{ db: Knex }>({
  db: [
    async ({ container }, use) => {
      const databaseName = `test_${Math.ceil(Math.random() * 1000)}`;
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

      const knexInstance = knex({
        client: 'postgres',
        connection: { ...connection, database: databaseName },
      });

      await use(knexInstance, async () => {
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
    },
    { scope: 'worker' },
  ],
});
