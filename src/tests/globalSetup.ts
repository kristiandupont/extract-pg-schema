import knex from 'knex';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

// import { startTestContainer } from './usePostgresContainer';

const containerLogPrefix = 'postgres-container>>> ';

let container: StartedTestContainer;

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

export const setup = async () => {
  if (process.arch === 'arm64') {
    // Ryuk doesn't work on arm64 at the time of writing.
    // Disable and prune docker images manually
    // eslint-disable-next-line no-process-env
    process.env['TESTCONTAINERS_RYUK_DISABLED'] = 'true';
  }

  container = await startTestContainer('postgres');

  const stream = await container.logs();
  stream
    // .on('data', (line) => console.log(containerLogPrefix + line))
    .on('err', (line) => console.error(containerLogPrefix + line))
    .on('end', () => console.info(containerLogPrefix + 'Stream closed'));

  // const config = {
  //   client: 'postgres',
  //   connection: {
  //     host: container.getHost(),
  //     database: 'postgres',
  //     port: container.getMappedPort(5432),
  //     password: 'postgres',
  //     user: 'postgres',
  //   },
  // };

  // const knexInstance = knex(config);

  // await knexInstance.destroy();
};

export const teardown = async () => {
  await container.stop({
    timeout: 10000,
  });
};
