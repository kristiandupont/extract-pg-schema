/* eslint-disable unicorn/prefer-top-level-await */
// eslint-disable-next-line unicorn/prefer-module
const l = require('./build');

// This generates the json for the dvdrental database, if that is running on localhost:54321.
const connection = {
  host: 'localhost',
  database: 'dvdrental',
  user: 'postgres',
  password: 'postgres',
  port: 54_321,
};
l.extractSchemas(connection).then((r) =>
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(r, null, 2))
);
