# Extract Schema from Postgres Database

This will read various metadata from your postgres database and return a js object.
This module is being used by [Kanel](https://github.com/kristiandupont/kanel) to generate Typescript types and [Schemalint](https://github.com/kristiandupont/schemalint) to provide linting of database schemas.

You hand it a [postgres connection config object](https://node-postgres.com/api/client) and the name of the schema you want to read.

## Installation

```
npm i extract-pg-schema
```

## Usage

```javascript
const { extractSchema } = require('extract-pg-schema');

async function run() {
  const connection = {
    host: 'localhost',
    database: 'postgres',
    user: 'postgres',
    password: 'postgres',
  };

  const { tables, views, types } = await extractSchema('public', connection);

  console.log('Tables:');
  console.log(tables);
  console.log('Views:');
  console.log(views);
  console.log('Types:');
  console.log(types);
}

run();
```

## Reference

This module exposes one function:

```
async extractSchema(schemaName, connectionConfig, resolveViews, tables)
```

It returns an object that has three properties: `tables`, `views` and `types`. All arrays.

### Table

The `tables` array consists of objects that correspond to the tables in the schema. It could look like this:

```javascript
{
  "name": "member",
  "comment": "Members of an organization",
  "tags": {},
  "columns": [
    {
      "name": "id",
      "tags": {},
      "indices": [
        {
          "name": "person_pkey",
          "isPrimary": true
        }
      ],
      "maxLength": null,
      "nullable": false,
      "defaultValue": "nextval('person_id_seq'::regclass)",
      "isPrimary": true,
      "isIdentity": false,
      "generated": "NEVER",
      "isUpdatable": true,
      "type": "int4",
      "comment": null,
      "rawInfo": {...},
    },
    {
      "name": "createdAt",
      "tags": {},
      "indices": [],
      "maxLength": null,
      "nullable": false,
      "defaultValue": null,
      "isIdentity": false,
      "generated": "NEVER",
      "isUpdatable": true,
      "type": "timestamptz",
      "comment": null
    },
    {
      "name": "displayName",
      "tags": {},
      "indices": [],
      "maxLength": null,
      "nullable": false,
      "defaultValue": null,
      "isIdentity": false,
      "generated": "NEVER",
      "isUpdatable": true,
      "type": "text",
      "comment": "Name that will be displayed in the UI",
      "rawInfo": {...},
    },
    {
      "name": "organizationId",
      "tags": {},
      "reference": {
        "schema": "public",
        "table": "organization",
        "column": "id",
        "onDelete": "CASCADE",
        "onUpdate": "NO ACTION"
      }
      "indices": [
        {
          "name": "member_organizationId_index",
          "isPrimary": false
        }
      ],
      "maxLength": null,
      "nullable": false,
      "defaultValue": null,
      "isIdentity": false,
      "generated": "NEVER",
      "isUpdatable": true,
      "type": "int4",
      "comment": null,
      "rawInfo": {...},
    }
  ]
}
```

Basically, a table has four properties: `name` which is the name of the table, `comment` which is the postgres table comment, `tags` which is a map of tags parsed out of the comment, and `columns` which represents the columns.
You can set the comment for a table with the following SQL:

```SQL
COMMENT ON TABLE "member" IS 'Members of an organization';
```

The tags feature uses the @-symbol, so you if you write a comment like this: `'Members of an organization @cached @alias:person'`, you will get

- a `comment` with the value `'Members of an organization'`, and
- a `tags` value of `{ cached: true, alias: 'person' }`

You can use tags for any sort of metadata that you want to store for further processing.

### Column

The `columns` array on a `table` has the following properties:

- `name` which is the column name,
- `reference`, an object containing schema, table and column names of a foreign key reference. Also has `onUpdate` and `onDelete` fields specifying update actions.
- `indices`, an array describing the indices that apply. These have two properties: `name` and `isPrimary`.
- `maxLength`, which specifies the max string length the column has if that applies.
- `nullable` which indicates if the column is nullable,
- `defaultValue` which states the possible default value for the column,
- `isIdentity` which states whether this is an identity column,
- `generated` representing the enum `ALWAYS`, `BY DEFAULT` or `NEVER` as to whether the column is generated
- `isUpdatable` specifying whether the column (in an updatable view in particular) can be updated
- `type` which specifies the [datatype](https://www.postgresql.org/docs/9.5/datatype.html) of the column
- `comment` which specifies the column comment.
- `tags` which is a map of tags parsed from the column comment
- `rawInfo` which contains all the column information that is extracted from postgres.

You can set the comment for a column with the following SQL:

```SQL
COMMENT ON COLUMN "member"."displayName" IS 'Name that will be displayed in the UI';
```

### View

Views have exactly the same shape as tables.

### Type

The second property in the result is the `types` array. This contains the user-specified types, currently only postgres [enum](https://www.postgresql.org/docs/9.2/datatype-enum.html) types and [composite](https://www.postgresql.org/docs/9.2/rowtypes.html).
An enum type could look like this:

```javascript
{
  "type": "enum",
  "name": "AccountState",
  "comment": "Determines the state of an account",
  "tags": {},
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

A composite type could look like this:

```javascript
{
  "type": "composite",
  "name": "AccountData",
  "comment": "Commonly used data for an account",
  "tags": {},
  "attributes": [
    {
      "name": "id",
      "maxLength": null,
      "nullable": true,
      "defaultValue": null,
      "type": "uuid",
      "tags": {},
      "rawInfo": {...}
    },
    {
      "name": "name",
      "maxLength": null,
      "nullable": true,
      "defaultValue": null,
      "type": "text",
      "tags": {},
      "rawInfo": {...}
    },
    {
      "name": "status",
      "maxLength": null,
      "nullable": true,
      "defaultValue": null,
      "type": "AccountState",
      "tags": {},
      "rawInfo": {...}
    },
    {
      "name": "address",
      "maxLength": null,
      "nullable": true,
      "defaultValue": null,
      "type": "jsonb",
      "tags": {},
      "rawInfo": {...}
    }
  ]
}
```

This would be the output if you had created the type with the following:

```SQL
CREATE TYPE "AccountData" AS (
  id      UUID,
  name    TEXT,
  status  "AccountState",
  address JSONB
);

COMMENT ON TYPE "AccountData" IS 'Commonly used data for an account';
```

### Attributes

The `attributes` array on a `type=composite` has the following properties:

- `name` which is the attribute name,
- `maxLength`, which specifies the max string length the attribute has if that applies.
- `nullable` which indicates if the attribute is nullable,
- `defaultValue` which states the possible default value for the attribute,
- `type` which specifies the [datatype](https://www.postgresql.org/docs/9.5/datatype.html) of the attribute
- `comment` which specifies the attribute comment.
- `tags` which is a map of tags parsed from the attribute comment
- `rawInfo` which contains all the attribute information that is extracted from postgres.

Type attribute comments work the same way as table column comments.

For an example of a generated object, take a look at [dvdrental.json](./dvdrental.json) file which is generated from the [sample Database](https://www.postgresqltutorial.com/postgresql-sample-database/) from www.postgresqltutorial.com.
