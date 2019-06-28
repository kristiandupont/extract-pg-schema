# Extract Schema from Postgres Database

This will read various metadata from your postgres database and return a js object.
You can use it for linting your migrations or for generating types to match your database schema.

You hand it an initialized [knex](https://knexjs.org/) instance and the name of the schema you want to read.

## Installation

```
npm i extract-pg-schema knex pg
```

## Usage

```javascript
const knex = require('knex');
const { extractSchema } = require('extract-pg-schema');

async function run() {
  const knexConfig = {
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'postgres',
      user: 'postgres',
      password: 'postgres'
    }
  };
  const db = knex(knexConfig);

  const tablesToSkip = ['knex_migrations', 'knex_migrations_lock'];
  const { models, types } = await extractSchema('public', tablesToSkip, db);

  console.log('Models:');
  console.log(models);
  console.log('Types:');
  console.log(types);
}

run();
```

## Reference
This module exposes one function:
```
extractSchema(schemaName, tablesToSkip, knexInstance)
```

It returns an object that has two properties: `models` and `types`. Both are arrays.

### Model
The `models` array consists of objects that correspond to the tables in the schema. It could look like this:

```javascript
{
  "name": "member",
  "comment": "Members of an organization",
  "properties": [
    {
      "name": "id",
      "indices": [
        {
          "name": "person_pkey",
          "isPrimary": true
        }
      ],
      "nullable": false,
      "defaultValue": "nextval('person_id_seq'::regclass)",
      "isPrimary": true,
      "type": "int4",
      "comment": null
    },
    {
      "name": "createdAt",
      "indices": [],
      "nullable": false,
      "defaultValue": null,
      "type": "timestamptz",
      "comment": null
    },
    {
      "name": "displayName",
      "indices": [],
      "nullable": false,
      "defaultValue": null,
      "type": "text",
      "comment": "Name that will be displayed in the UI"
    },
    {
      "name": "organizationId",
      "parent": "organization.id",
      "indices": [
        {
          "name": "member_organizationId_index",
          "isPrimary": false
        }
      ],
      "nullable": false,
      "defaultValue": null,
      "type": "int4",
      "comment": null
    }
  ]
}
```

Basically, a model has three properties: `name` which is the name of the table, `comment` which is the postgres table comment and `properties` which represents the columns.
You can set the comment for a table with the following SQL:
```SQL
COMMENT ON TABLE "member" IS 'Members of an organization';
```

### Property
The `properties` array on a `model` has the following properties:
- `name` which is the column name,
- `parent` which is the referenced table and column if the column has a foreign key
- `indices`, an array describing the indices that apply. These have two properties: `name` and `isPrimary`.
- `nullable` which indicates if the column is nullable,
- `defaultValue` which states the possible default value for the column,
- `type` which specifies the [datatype](https://www.postgresql.org/docs/9.5/datatype.html) of the column
- `comment` which specifies the column comment.

You can set the comment for a column with the following SQL:
```SQL
COMMENT ON COLUMN "member"."displayName" IS 'Name that will be displayed in the UI';
```

### Type
The second property in the result is the `types` array. This contains the user-specified types, currently only postgres [enum](https://www.postgresql.org/docs/9.2/datatype-enum.html) types.
A type could look like this:

```javascript
{
  "type": "enum",
  "name": "AccountState",
  "comment": "Determines the state of an account",
  "values": [
    "active",
    "pending",
    "closed"
  ]
}
```

This would be the output if you had created the type with the following:
```SQL
CREATE TYPE "AccountState" AS ENUM ('active', 'pending', 'closed');

COMMENT ON TYPE "AccountState" IS 'Determines the state of an account';
```
