# Extract Schema from Postgres Database

Reads various metadata from your postgres database and returns a js object.
This package is used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

## Installation

```bash
npm i extract-pg-schema
```

## Library Usage

You give it a [postgres connection config object](https://node-postgres.com/apis/client) and some options and it will connect to your database and generate

```javascript
const { extractSchemas } = require("extract-pg-schema");

async function run() {
  const connection = {
    host: "localhost",
    database: "postgres",
    user: "postgres",
    password: "postgres",
  };

  const result = await extractSchemas(connection);

  console.log(result);
}

run();
```

The generated output is a record of schemas, described with the [Schema](/api/extract-pg-schema.schema.html) type.

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
