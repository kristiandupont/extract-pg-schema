import { test as base } from './useTestKnex';

export const testWith = ({ schemaNames }: { schemaNames: string[] }) => {
  return base.extend<{ schema: void }>({
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
};

export const test = testWith({ schemaNames: ['test'] });
