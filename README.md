# Extract Schema from Postgres Database

Reads various metadata from your postgres database and return a Javascript object.
This package is used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

View the documentation [here](https://kristiandupont.github.io/extract-pg-schema)

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

For an example of a generated object, take a look at [dvdrental.json](./dvdrental.json) file which is generated from the [sample Database](https://www.postgresqltutorial.com/postgresql-sample-database/) from [PostgreSQLTutorial.com](https://www.postgresqltutorial.com).

---

## Contributors

<a href="https://github.com/kristiandupont/extract-pg-schema/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kristiandupont/extract-pg-schema" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
