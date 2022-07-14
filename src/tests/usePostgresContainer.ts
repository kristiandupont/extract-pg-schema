import { StartedTestContainer } from 'testcontainers';

import startTestContainer from './startTestContainer';

const timeout = 5 * 60 * 1000;

import { test as base } from 'vitest-fixture';

export const testWith = (image: string) => {
  return base.extend<{}, { container: StartedTestContainer }>({
    container: [
      async ({}, use) => {
        const container = await startTestContainer(image);
        await use(container);
      },
      { scope: 'worker' },
    ],
  });
};

export const test = testWith('postgres');
