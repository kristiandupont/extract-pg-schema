<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [extract-pg-schema](./extract-pg-schema.md) &gt; [TableIndexColumn](./extract-pg-schema.tableindexcolumn.md)

## TableIndexColumn interface

Column in an index.

**Signature:**

```typescript
export interface TableIndexColumn 
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

[definition](./extract-pg-schema.tableindexcolumn.definition.md)


</td><td>


</td><td>

string


</td><td>

Definition of index column.


</td></tr>
<tr><td>

[name](./extract-pg-schema.tableindexcolumn.name.md)


</td><td>


</td><td>

string \| null


</td><td>

Column name or null if functional index.


</td></tr>
<tr><td>

[predicate](./extract-pg-schema.tableindexcolumn.predicate.md)


</td><td>


</td><td>

string \| null


</td><td>

Predicate of the partial index or null if regular index.


</td></tr>
</tbody></table>
