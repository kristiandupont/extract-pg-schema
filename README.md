# Extract Schema from Postgres Database

Reads various metadata from your postgres database and return a Javascript object.
This package is used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

View the documentation [here](https://kristiandupont.github.io/extract-pg-schema)

## Installation

```bash
npm i extract-pg-schema
```

## Library Usage

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

## CLI Usage

You can also use the CLI to extract the schemas from a database and write it to the console or a file in JSON format.

```bash
npx extract-pg-schema -h localhost -p 5432 -U postgres -d postgres > schemas.json
```

The CLI takes a small subset of the options that [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) takes. You can also use the [environment variables](https://node-postgres.com/features/connecting#environment-variables) starting with `PG` to set the connection parameters.

```
Usage: extract-pg-schema [options] [DBNAME]

Extract all schemas from a PostgreSQL database and print them as JSON.

Options:
    --help                      show this help
    -h, --host=HOSTNAME         database server host or socket directory
    -p, --port=PORT             database server port
    -U, --username=USERNAME     database user name
    -d, --dbname=DBNAME         database name to connect to
    -n, --schema=SCHEMA         include schema regular expression (may be given multiple times)
    -N, --exclude-schema=SCHEMA exclude schema regular expression (may be given multiple times)
```

---

## Contributors

<a href="https://github.com/kristiandupont/extract-pg-schema/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kristiandupont/extract-pg-schema" />
</a>

Made with [contrib.rocks](https://contrib.rocks).
