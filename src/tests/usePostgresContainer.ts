import { StartedTestContainer } from 'testcontainers';

import { beforeAll } from './fixture';
import startTestContainer from './startTestContainer';

const timeout = 5 * 60 * 1000;

const usePostgresContainer = (image: string = 'postgres') => {
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await startTestContainer(image);
  }, timeout);

  return () => container;
};

export default usePostgresContainer;
