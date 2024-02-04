# Extract Schema from Postgres Database

Reads various metadata from your postgres database and returns a js object.
This package is used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

## Installation

```bash
npm i extract-pg-schema
```

## Usage

You give it a [postgres connection config object](https://node-postgres.com/apis/client) and some options and it will connect to your database and generate

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

The generated output is a record of schemas, described with the [Schema](/api/extract-pg-schema.schema.html) type.
