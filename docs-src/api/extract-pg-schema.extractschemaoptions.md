<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [extract-pg-schema](./extract-pg-schema.md) &gt; [ExtractSchemaOptions](./extract-pg-schema.extractschemaoptions.md)

## ExtractSchemaOptions interface

This is the options object that can be passed to `extractSchemas`<!-- -->.

**Signature:**

```typescript
export interface ExtractSchemaOptions 
```

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[onProgress?](./extract-pg-schema.extractschemaoptions.onprogress.md)


</td><td>


</td><td>

() =&gt; void


</td><td>

_(Optional)_ Called once for each type that is extracted.


</td></tr>
<tr><td>

[onProgressEnd?](./extract-pg-schema.extractschemaoptions.onprogressend.md)


</td><td>


</td><td>

() =&gt; void


</td><td>

_(Optional)_ Called when all types have been extracted.


</td></tr>
<tr><td>

[onProgressStart?](./extract-pg-schema.extractschemaoptions.onprogressstart.md)


</td><td>


</td><td>

(total: number) =&gt; void


</td><td>

_(Optional)_ Called with the number of types to extract.


</td></tr>
<tr><td>

[resolveViews?](./extract-pg-schema.extractschemaoptions.resolveviews.md)


</td><td>


</td><td>

boolean


</td><td>

_(Optional)_ extractShemas will always attempt to parse view definitions to discover the "source" of each column, i.e. the table or view that it is derived from. If this option is set to `true`<!-- -->, it will attempt to follow this source and copy values like indices, isNullable, etc. so that the view data is closer to what the database reflects.


</td></tr>
<tr><td>

[schemas?](./extract-pg-schema.extractschemaoptions.schemas.md)


</td><td>


</td><td>

string\[\]


</td><td>

_(Optional)_ Will contain an array of schema names to extract. If undefined, all non-system schemas will be extracted.


</td></tr>
<tr><td>

[typeFilter?](./extract-pg-schema.extractschemaoptions.typefilter.md)


</td><td>


</td><td>

(pgType: [PgType](./extract-pg-schema.pgtype.md)<!-- -->) =&gt; boolean


</td><td>

_(Optional)_ Filter function that you can use if you want to exclude certain items from the schemas.


</td></tr>
</tbody></table>
