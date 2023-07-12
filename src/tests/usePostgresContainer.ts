import { StartedTestContainer } from 'testcontainers';
import { test as base, TestType } from 'vitest-fixture';

import startTestContainer from './startTestContainer';

export const testWith = (
  image: string,
): TestType<Record<string, unknown>, { container: StartedTestContainer }> =>
  base.extend<Record<string, unknown>, { container: StartedTestContainer }>({
    container: [
      async (_, use) => {
        const container = await startTestContainer(image);
        await use(container);
      },
      { scope: 'worker' },
    ],
  });

export const test = testWith('postgres');
