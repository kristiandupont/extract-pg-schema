import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { beforeAll } from './fixture';

const timeout = 5 * 60 * 1000;

export const startTestContainer = async (image: string) =>
  // Starting this with withReuse() enabled will spin up the container
  // on the first call and then reuse it on subsequent calls.
  new GenericContainer(image)
    .withReuse()
    .withExposedPorts(5432)
    .withEnv('POSTGRES_PASSWORD', 'postgres')
    .withStartupTimeout(timeout)
    .start();

const usePostgresContainer = (image: string = 'postgres') => {
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await startTestContainer(image);
  }, timeout);

  return () => container;
};

export default usePostgresContainer;
