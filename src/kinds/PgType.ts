export const typeKindMap = {
  d: 'domain',
  e: 'enum',
  r: 'range',

  // Not supported (yet):
  // m: 'multiRange',
  // b: 'base',
  // p: 'pseudo',

  // c: 'composite', -- is also a class, handled below.
} as const;
type TypeKind = typeof typeKindMap[keyof typeof typeKindMap];

export const classKindMap = {
  r: 'table',
  p: 'table', // Treat partitioned tables as tables
  v: 'view',
  m: 'materializedView',
  c: 'compositeType',

  // Not supported (yet):
  // i: 'index',
  // S: 'sequence',
  // t: 'toastTable',
  // f: 'foreignTable',
  // I: 'partitionedIndex',
} as const;
type ClassKind = typeof classKindMap[keyof typeof classKindMap];

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

type PgType<K extends Kind = Kind> = {
  name: string;
  schemaName: string;
  kind: K;
  comment: string | null;
};

export default PgType;
