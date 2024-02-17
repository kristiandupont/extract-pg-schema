import type { StartedTestContainer } from "testcontainers";
import type { TestType } from "vitest-fixture";
import { test as base } from "vitest-fixture";

import startTestContainer from "./startTestContainer";

export const testWith = (
  image: string,
): TestType<Record<string, unknown>, { container: StartedTestContainer }> =>
  base.extend<Record<string, unknown>, { container: StartedTestContainer }>({
    container: [
      async (_, use) => {
        const container = await startTestContainer(image);
        await use(container);
      },
      { scope: "worker" },
    ],
  });

export const test = testWith("postgres");
