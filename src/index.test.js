const { GenericContainer, Wait } = require('testcontainers');
const { Duration, TemporalUnit } = require('node-duration');
const index = require('./index');

const containerLogPrefix = "postgres-container>>> ";
let pgContainer = new GenericContainer('postgres')
    .withExposedPorts(5432)
    .withEnv('POSTGRES_PASSWORD', 'postgres')
    .withStartupTimeout()
    .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections')
    );
let config;

beforeAll(async () => {
  jest.setTimeout(30000);
  pgContainer = await pgContainer.start();
  const stream = await pgContainer.logs();
  stream
    .on("data", line => console.log(containerLogPrefix + line))
    .on("err", line => console.error(containerLogPrefix + line))
    .on("end", () => console.log(containerLogPrefix + "Stream closed"));
  config = {
    client: 'postgres',
    debug: true,
    connection: {
      host: pgContainer.getContainerIpAddress(),
      database: 'postgres',
      port: pgContainer.getMappedPort(5432),
      password: 'postgres',
      user: 'postgres',
    },
  };
  const setupDB = require('knex')(config);

  await setupDB.schema
    .withSchema('public')
    .createTable('default_table', (table) => {
      table.increments();
      table.enu('cust_type', ['value1', 'value2'], {
        useNative: true,
        enumName: 'cust_type',
      });
      table.string('name');
      table.boolean('flag');
      table.timestamps();
      table.jsonb('json_field');
      table.uuid('uuid_col');
    });
  await setupDB.schema.raw(
    'CREATE VIEW public.default_view AS select * from public.default_table'
  );
  await setupDB.schema.createSchemaIfNotExists('not_default');
  await setupDB.schema.raw(
    "CREATE TYPE not_default.cust_type_not_default as ENUM ('custom1', 'custom2');"
  );
  await setupDB.schema
    .withSchema('not_default')
    .createTable('not_default_table', (table) => {
      table.increments();
      table.enu('cust_type_not_default', ['custom1', 'custom2'], {
        useNative: true,
        existingType: true,
        enumName: 'cust_type_not_default',
        schemaName: 'not_default',
      });
      table.string('name_2');
      table.boolean('flag_2');
      table.timestamps();
      table.jsonb('json_2');
      table.uuid('uuid_2');
    });
  await setupDB.schema.raw(
    'CREATE VIEW not_default.not_default_view AS select * from not_default.not_default_table'
  );
  await setupDB.destroy();
});

afterAll(async () => {
  await pgContainer.stop({
    timeout: new Duration(10, TemporalUnit.SECONDS),
  });
});

test('in default schema', async () => {
  const db = require('knex')(config);
  let extracted = await index.extractSchema('public', db);

  expect(extracted.tables.length).toBe(1);
  expect(extracted.tables[0].name).toBe('default_table');

  expect(extracted.views.length).toBe(1);
  expect(extracted.views[0].name).toBe('default_view');

  expect(extracted.types.length).toBe(2);
  expect(extracted.types.filter((t) => t.name === 'cust_type')).not.toBeNull();
  expect(
    extracted.types.filter((t) => t.name === 'cust_type_not_default')
  ).not.toBeNull();
});

test('in not default schema', async () => {
  const db = require('knex')(config);
  let extracted = await index.extractSchema('not_default', db);

  expect(extracted.tables.length).toBe(1);
  expect(extracted.tables[0].name).toBe('not_default_table');

  expect(extracted.views.length).toBe(1);
  expect(extracted.views[0].name).toBe('not_default_view');

  expect(extracted.types.length).toBe(2);
  expect(extracted.types.filter((t) => t.name === 'cust_type')).not.toBeNull();
  expect(
    extracted.types.filter((t) => t.name === 'cust_type_not_default')
  ).not.toBeNull();
});
