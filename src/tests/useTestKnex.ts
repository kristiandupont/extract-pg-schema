import knex, { Knex } from 'knex';

import { afterAll, beforeAll } from './fixture';
import usePostgresContainer from './usePostgresContainer';

const useTestKnex = () => {
  let knexInstance: Knex;

  const getContainer = usePostgresContainer();

  beforeAll(async () => {
    const container = getContainer();

    const config = {
      client: 'postgres',
      connection: {
        host: container.getHost(),
        database: 'postgres',
        port: container.getMappedPort(5432),
        password: 'postgres',
        user: 'postgres',
      },
    };

    knexInstance = knex(config);
  });

  afterAll(() => knexInstance.destroy());

  return () => knexInstance;
};

export default useTestKnex;
