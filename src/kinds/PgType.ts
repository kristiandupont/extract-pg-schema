export const typeKindMap = {
  d: "domain",
  e: "enum",
  r: "range",

  // Not supported (yet):
  // m: 'multiRange',
  // b: 'base',
  // p: 'pseudo',

  // c: 'composite', -- is also a class, handled below.
} as const;
type TypeKind = (typeof typeKindMap)[keyof typeof typeKindMap];

export const classKindMap = {
  r: "table",
  p: "table", // Treat partitioned tables as tables
  v: "view",
  m: "materializedView",
  c: "compositeType",
  f: "foreignTable",

  // Not supported (yet):
  // i: 'index',
  // S: 'sequence',
  // t: 'toastTable',
  // I: 'partitionedIndex',
} as const;
type ClassKind = (typeof classKindMap)[keyof typeof classKindMap];

// Routines are not supported yet.
// export const routineKindMap = {
//   p: 'procedure',
//   f: 'function',
//   a: 'aggregate',

//   // Not supported (yet):
//   // w: 'windowFunction',
// };
// type RoutineKind = typeof routineKindMap[keyof typeof routineKindMap];

export type Kind = TypeKind | ClassKind; //  | RoutineKind;

/**
 * Base type for Postgres objects.
 */
type PgType<K extends Kind = Kind> = {
  /**
   * The name of the object.
   */
  name: string;
  /**
   * The name of the schema that the object is in.
   */
  schemaName: string;
  /**
   * The kind of the object.
   */
  kind: K;
  /**
   * The comment on the object, if any.
   */
  comment: string | null;
};

export default PgType;
