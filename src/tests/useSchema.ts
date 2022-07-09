import { Knex } from 'knex';

import { test as base } from './useTestKnex';

const schemaName = 'test'; // TODO

export const test = base.extend<{ schema: void }>({
  schema: async ({ knex: [db] }, use) => {
    await db.schema.createSchemaIfNotExists(schemaName);
    await use(undefined, async () => {
      await db.schema.dropSchemaIfExists(schemaName, true);
    });
  },
});
