const l = require('./build');
const knex = require('knex');

// This generates the json for the dvdrental database, if that is running on localhost:54321.
const cfg = {
  client: 'pg',
  connection: {
    host: 'localhost',
    database: 'dvdrental',
    user: 'postgres',
    password: 'postgres',
    port: 54321,
  },
};
const db = knex(cfg);

l.extractSchema('public', db).then((r) =>
  console.log(JSON.stringify(r, null, 2))
);
