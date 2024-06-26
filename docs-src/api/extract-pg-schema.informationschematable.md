<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [extract-pg-schema](./extract-pg-schema.md) &gt; [InformationSchemaTable](./extract-pg-schema.informationschematable.md)

## InformationSchemaTable interface

The view tables contains all tables and views defined in the current database. Only those tables and views are shown that the current user has access to (by way of being the owner or having some privilege).

**Signature:**

```typescript
interface InformationSchemaTable 
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

[commit\_action](./extract-pg-schema.informationschematable.commit_action.md)


</td><td>


</td><td>

any


</td><td>

Not yet implemented


</td></tr>
<tr><td>

[is\_insertable\_into](./extract-pg-schema.informationschematable.is_insertable_into.md)


</td><td>


</td><td>

[YesNo](./extract-pg-schema.yesno.md)


</td><td>

YES if the table is insertable into, NO if not (Base tables are always insertable into, views not necessarily.)


</td></tr>
<tr><td>

[is\_typed](./extract-pg-schema.informationschematable.is_typed.md)


</td><td>


</td><td>

[YesNo](./extract-pg-schema.yesno.md)


</td><td>

YES if the table is a typed table, NO if not


</td></tr>
<tr><td>

[reference\_generation](./extract-pg-schema.informationschematable.reference_generation.md)


</td><td>


</td><td>

string \| null


</td><td>

Applies to a feature not available in PostgreSQL


</td></tr>
<tr><td>

[self\_referencing\_column\_name](./extract-pg-schema.informationschematable.self_referencing_column_name.md)


</td><td>


</td><td>

string \| null


</td><td>

Applies to a feature not available in PostgreSQL


</td></tr>
<tr><td>

[table\_catalog](./extract-pg-schema.informationschematable.table_catalog.md)


</td><td>


</td><td>

string


</td><td>

Name of the database that contains the table (always the current database)


</td></tr>
<tr><td>

[table\_name](./extract-pg-schema.informationschematable.table_name.md)


</td><td>


</td><td>

string


</td><td>

Name of the table


</td></tr>
<tr><td>

[table\_schema](./extract-pg-schema.informationschematable.table_schema.md)


</td><td>


</td><td>

string


</td><td>

Name of the schema that contains the table


</td></tr>
<tr><td>

[table\_type](./extract-pg-schema.informationschematable.table_type.md)


</td><td>


</td><td>

"BASE TABLE" \| "VIEW" \| "FOREIGN" \| "LOCAL TEMPORARY"


</td><td>

Type of the table: BASE TABLE for a persistent base table (the normal table type), VIEW for a view, FOREIGN for a foreign table, or LOCAL TEMPORARY for a temporary table


</td></tr>
<tr><td>

[user\_defined\_type\_catalog](./extract-pg-schema.informationschematable.user_defined_type_catalog.md)


</td><td>


</td><td>

string \| null


</td><td>

If the table is a typed table, the name of the database that contains the underlying data type (always the current database), else null.


</td></tr>
<tr><td>

[user\_defined\_type\_name](./extract-pg-schema.informationschematable.user_defined_type_name.md)


</td><td>


</td><td>

string \| null


</td><td>

If the table is a typed table, the name of the underlying data type, else null.


</td></tr>
<tr><td>

[user\_defined\_type\_schema](./extract-pg-schema.informationschematable.user_defined_type_schema.md)


</td><td>


</td><td>

string \| null


</td><td>

If the table is a typed table, the name of the schema that contains the underlying data type, else null.


</td></tr>
</tbody></table>
