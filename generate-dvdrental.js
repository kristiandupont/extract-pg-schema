const l = require('./build');

// This generates the json for the dvdrental database, if that is running on localhost:54321.
const connection = {
  host: 'localhost',
  database: 'dvdrental',
  user: 'postgres',
  password: 'postgres',
  port: 54321,
};
l.extractSchema('public', connection).then((r) =>
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(r, null, 2))
);
