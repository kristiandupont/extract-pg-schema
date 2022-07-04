# Extract Schema from Postgres Database

This will read various metadata from your postgres database and return a js object.
This module is being used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

## Installation

```bash
npm i extract-pg-schema
```

## Usage

You give it a [postgres connection config object](https://node-postgres.com/api/client) and some options and it will connect to your database and generate

```javascript
const { extractSchemas } = require('extract-pg-schema');

async function run() {
  const connection = {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  };

  const result = await extractSchemas(connection);

  console.log(result);
}

run();
```
