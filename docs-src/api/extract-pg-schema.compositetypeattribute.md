<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [extract-pg-schema](./extract-pg-schema.md) &gt; [CompositeTypeAttribute](./extract-pg-schema.compositetypeattribute.md)

## CompositeTypeAttribute interface

Attribute of a composite type.

**Signature:**

```typescript
export interface CompositeTypeAttribute 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [comment](./extract-pg-schema.compositetypeattribute.comment.md) |  | string \| null | Comment on the attribute. |
|  [defaultValue](./extract-pg-schema.compositetypeattribute.defaultvalue.md) |  | any | Default value of the attribute. |
|  [expandedType](./extract-pg-schema.compositetypeattribute.expandedtype.md) |  | string | Expanded type name. If the type is an array, brackets will be appended to the type name. |
|  [fakeInformationSchemaValue](./extract-pg-schema.compositetypeattribute.fakeinformationschemavalue.md) |  | [InformationSchemaColumn](./extract-pg-schema.informationschemacolumn.md) | The Postgres information\_schema views do not contain info about materialized views. This value is the result of a query that matches the one for regular views. Use with caution, not all fields are guaranteed to be meaningful and/or accurate. |
|  [generated](./extract-pg-schema.compositetypeattribute.generated.md) |  | "ALWAYS" \| "NEVER" \| "BY DEFAULT" | Behavior of the generated attribute. "ALWAYS" if always generated, "NEVER" if never generated, "BY DEFAULT" if generated when a value is not provided. |
|  [isArray](./extract-pg-schema.compositetypeattribute.isarray.md) |  | boolean | Whether the attribute is an array. |
|  [isIdentity](./extract-pg-schema.compositetypeattribute.isidentity.md) |  | boolean | Whether the attribute is an identity attribute. |
|  [isNullable](./extract-pg-schema.compositetypeattribute.isnullable.md) |  | boolean | Whether the attribute is nullable. |
|  [isUpdatable](./extract-pg-schema.compositetypeattribute.isupdatable.md) |  | boolean | Whether the attribute is updatable. |
|  [maxLength](./extract-pg-schema.compositetypeattribute.maxlength.md) |  | number \| null | Maximum length of the attribute. |
|  [name](./extract-pg-schema.compositetypeattribute.name.md) |  | string | Attribute name. |
|  [ordinalPosition](./extract-pg-schema.compositetypeattribute.ordinalposition.md) |  | number | Ordinal position of the attribute in the composite type. Starts from 1. |
|  [type](./extract-pg-schema.compositetypeattribute.type.md) |  | [AttributeType](./extract-pg-schema.attributetype.md) | Type information. |

