/**
 * The view domains contains all domains defined in the current database. Only those domains are shown that the current user has access to (by way of being the owner or having some privilege).
 */
interface InformationSchemaDomain {
  /** Name of the database that contains the domain (always the current database) */
  domain_catalog: string;
  /** Name of the schema that contains the domain */
  domain_schema: string;
  /** Name of the domain */
  domain_name: string;
  /** Data type of the domain, if it is a built-in type, or ARRAY if it is some array (in that case, see the view element_types), else USER-DEFINED (in that case, the type is identified in udt_name and associated columns). */
  data_type: string;
  /** If the domain has a character or bit string type, the declared maximum length; null for all other data types or if no maximum length was declared. */
  character_maximum_length: number | null;
  /** If the domain has a character type, the maximum possible length in octets (bytes) of a datum; null for all other data types. The maximum octet length depends on the declared character maximum length (see above) and the server encoding. */
  character_octet_length: number | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  character_set_name: string | null;
  /** Name of the database containing the collation of the domain (always the current database), null if default or the data type of the domain is not collatable */
  collation_catalog: string | null;
  /** Name of the schema containing the collation of the domain, null if default or the data type of the domain is not collatable */
  collation_schema: string | null;
  /** Name of the collation of the domain, null if default or the data type of the domain is not collatable */
  collation_name: string | null;
  /** If the domain has a numeric type, this column contains the (declared or implicit) precision of the type for this domain. The precision indicates the number of significant digits. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column numeric_precision_radix. For all other data types, this column is null. */
  numeric_precision: number | null;
  /** If the domain has a numeric type, this column indicates in which base the values in the columns numeric_precision and numeric_scale are expressed. The value is either 2 or 10. For all other data types, this column is null. */
  numeric_precision_radix: number | null;
  /** If the domain has an exact numeric type, this column contains the (declared or implicit) scale of the type for this domain. The scale indicates the number of significant digits to the right of the decimal point. It can be expressed in decimal (base 10) or binary (base 2) terms, as specified in the column numeric_precision_radix. For all other data types, this column is null. */
  numeric_scale: number | null;
  /** If data_type identifies a date, time, timestamp, or interval type, this column contains the (declared or implicit) fractional seconds precision of the type for this domain, that is, the number of decimal digits maintained following the decimal point in the seconds value. For all other data types, this column is null. */
  datetime_precision: number | null;
  /** If data_type identifies an interval type, this column contains the specification which fields the intervals include for this domain, e.g., YEAR TO MONTH, DAY TO SECOND, etc. If no field restrictions were specified (that is, the interval accepts all fields), and for all other data types, this field is null. */
  interval_type: string | null;
  /** Applies to a feature not available in PostgreSQL (see datetime_precision for the fractional seconds precision of interval type domains) */
  interval_precision: number | null;
  /** Default expression of the domain */
  domain_default: string | null;
  /** Name of the database that the domain data type is defined in (always the current database) */
  udt_catalog: string | null;
  /** Name of the schema that the domain data type is defined in */
  udt_schema: string | null;
  /** Name of the domain data type */
  udt_name: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_catalog: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_schema: string | null;
  /** Applies to a feature not available in PostgreSQL */
  scope_name: string | null;
  /** Always null, because arrays always have unlimited maximum cardinality in PostgreSQL */
  maximum_cardinality: number | null;
  /** An identifier of the data type descriptor of the domain, unique among the data type descriptors pertaining to the domain (which is trivial, because a domain only contains one data type descriptor). This is mainly useful for joining with other instances of such identifiers. (The specific format of the identifier is not defined and not guaranteed to remain the same in future versions.) */
  dtd_identifier: string | null;
}

export default InformationSchemaDomain;
