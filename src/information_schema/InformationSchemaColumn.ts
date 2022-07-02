import YesNo from './YesNo';

/**
 * The view columns contains information about all table columns (or view columns) in the database. System columns (ctid, etc.) are not included. Only those columns are shown that the current user has access to (by way of being the owner or having some privilege).
 */
interface InformationSchemaColumn {
  /** Name of the database containing the table (always the current database) */
  table_catalog: string;
  /** Name of the schema containing the table */
  table_schema: string;
  /** Name of the table */
  table_name: string;
  /** Name of the column */
  column_name: string;
  /** Ordinal position of the column within the table (count starts at 1) */
  ordinal_position: number;
  /** Default expression of the column */
  column_default: any;
  /** YES if the column is possibly nullable, NO if it is known not nullable. A not-null constraint is one way a column can be known not nullable, but there can be others. */
  is_nullable: YesNo;
  /** Data type of the column, if it is a built-in type, or ARRAY if it is some array (in that case, see the view element_types), else USER-DEFINED (in that case, the type is identified in udt_name and associated columns). If the column is based on a domain, this column refers to the type underlying the domain (and the domain is identified in domain_name and associated columns). */
  data_type: string;
  /** If data_type identifies a character or bit string type, the declared maximum length; null for all other data types or if no maximum length was declared. */
  character_maximum_length: number | null;
  /** If data_type identifies a character type, the maximum possible length in octets (bytes) of a datum; null for all other data types. The maximum octet length depends on the declared character maximum length (see above) and the server encoding. */
  character_octet_length: number | null;
  /** If data_type identifies a numeric type, this column contains the (declared or implicit) precision of the type for this column. The precision indicates the number of significant digits. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column numeric_precision_radix. For all other data types, this column is null. */
  numeric_precision: number | null;
  /** If data_type identifies a numeric type, this column indicates in which base the values in the columns numeric_precision and numeric_scale are expressed. The value is either 2 or 10. For all other data types, this column is null. */
  numeric_precision_radix: number;
  /** If data_type identifies an exact numeric type, this column contains the (declared or implicit) scale of the type for this column. The scale indicates the number of significant digits to the right of the decimal point. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column numeric_precision_radix. For all other data types, this column is null. */
  numeric_scale: number | null;
  /** If data_type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit) fractional seconds precision of the type for this column, that is, the number of decimal digits maintained following the decimal point in the seconds value. For all other data types, this column is null. */
  datetime_precision: number | null;
  /** If data_type identifies an interval type, this column contains the specification which fields the intervals include for this column, e.g., YEAR TO MONTH, DAY TO SECOND, etc. If no field restrictions were specified (that is, the interval accepts all fields), and for all other data types, this field is null. */
  interval_type: string | null;
  /** Applies to a feature not available in PostgreSQL (see datetime_precision for the fractional seconds precision of interval type columns) */
  interval_precision: number | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_name: string | null;
  /** Name of the database containing the collation of the column (always the current database), null if default or the data type of the column is not collatable */
  collation_catalog: string | null;
  /** Name of the schema containing the collation of the column, null if default or the data type of the column is not collatable */
  collation_schema: string | null;
  /** Name of the collation of the column, null if default or the data type of the column is not collatable */
  collation_name: string | null;
  /** If the column has a domain type, the name of the database that the domain is defined in (always the current database), else null. */
  domain_catalog: string | null;
  /** If the column has a domain type, the name of the schema that the domain is defined in, else null. */
  domain_schema: string | null;
  /** If the column has a domain type, the name of the domain, else null. */
  domain_name: string | null;
  /** Name of the database that the column data type (the underlying type of the domain, if applicable) is defined in (always the current database) */
  udt_catalog: string;
  /** Name of the schema that the column data type (the underlying type of the domain, if applicable) is defined in */
  udt_schema: string;
  /** Name of the column data type (the underlying type of the domain, if applicable) */
  udt_name: string;
  /** Applies to a feature not available in PostgreSQL */
  scope_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_name: string | null;
  /** Always null, because arrays always have unlimited maximum cardinality in PostgreSQL */
  maximum_cardinality: null;
  /** An identifier of the data type descriptor of the column, unique among the data type descriptors pertaining to the table. This is mainly useful for joining with other instances of such identifiers. (The specific format of the identifier is not defined and not guaranteed to remain the same in future versions.) */
  dtd_identifier: string;
  /** Applies to a feature not available in PostgreSQL */
  is_self_referencing: YesNo;
  /** If the column is an identity column, then YES, else NO. */
  is_identity: YesNo;
  /** If the column is an identity column, then ALWAYS or BY DEFAULT, reflecting the definition of the column. */
  identity_generation: 'ALWAYS' | 'BY DEFAULT' | null;
  /** If the column is an identity column, then the start value of the internal sequence, else null. */
  identity_start: string | null;
  /** If the column is an identity column, then the increment of the internal sequence, else null. */
  identity_increment: string | null;
  /** If the column is an identity column, then the maximum value of the internal sequence, else null. */
  identity_maximum: string | null;
  /** If the column is an identity column, then the minimum value of the internal sequence, else null. */
  identity_minimum: string | null;
  /** If the column is an identity column, then YES if the internal sequence cycles or NO if it does not; otherwise null. */
  identity_cycle: string;
  /** If the column is a generated column, then ALWAYS, else NEVER. */
  is_generated: 'ALWAYS' | 'NEVER';
  /** If the column is a generated column, then the generation expression, else null. */
  generation_expression: any;
  /** YES if the column is updatable, NO if not (Columns in base tables are always updatable, columns in views not necessarily) */
  is_updatable: YesNo;
}

export default InformationSchemaColumn;
