<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [extract-pg-schema](./extract-pg-schema.md) &gt; [extractSchemas](./extract-pg-schema.extractschemas.md)

## extractSchemas() function

Perform the extraction

**Signature:**

```typescript
declare function extractSchemas(connectionConfig: string | ConnectionConfig, options?: ExtractSchemaOptions): Promise<Record<string, Schema>>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

connectionConfig


</td><td>

string \| ConnectionConfig


</td><td>

Connection string or configuration object for Postgres connection


</td></tr>
<tr><td>

options


</td><td>

[ExtractSchemaOptions](./extract-pg-schema.extractschemaoptions.md)


</td><td>

_(Optional)_ Optional options


</td></tr>
</tbody></table>
**Returns:**

Promise&lt;Record&lt;string, [Schema](./extract-pg-schema.schema.md)<!-- -->&gt;&gt;

A record of all the schemas extracted, indexed by schema name.

