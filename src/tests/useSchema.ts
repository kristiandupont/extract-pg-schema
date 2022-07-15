import { Knex } from 'knex';
import { StartedTestContainer } from 'testcontainers';
import { TestType } from 'vitest-fixture';

import { test as base } from './useTestKnex';

export const testWith = ({
  schemaNames,
}: {
  schemaNames: string[];
}): TestType<
  { schema: void },
  {
    container: StartedTestContainer;
  } & {
    knex: [db: Knex, databaseName: string];
  }
> =>
  base.extend<{ schema: void }>({
    schema: async ({ knex: [db] }, use) => {
      for (const schemaName of schemaNames) {
        await db.schema.createSchemaIfNotExists(schemaName);
      }
      await use(undefined, async () => {
        for (const schemaName of schemaNames) {
          await db.schema.dropSchemaIfExists(schemaName, true);
        }
      });
    },
  });

export const test = testWith({ schemaNames: ['test'] });
