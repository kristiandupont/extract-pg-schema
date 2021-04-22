const l = require('./build');
const knex = require('knex');

// This generates the json for the dvdrental database, if that is running on localhost:54321.
const connection = {
  host: 'localhost',
  database: 'dvdrental',
  user: 'postgres',
  password: 'postgres',
  port: 54321,
};
l.extractSchema('public', connection).then((r) =>
  console.log(JSON.stringify(r, null, 2))
);
