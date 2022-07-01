export const typeKindMap = {
  d: 'domain',
  e: 'enum',
  r: 'range',
  m: 'multiRange',

  // Not supported (yet):
  // b: 'base',
  // p: 'pseudo',
} as const;
type TypeKind = typeof typeKindMap[keyof typeof typeKindMap];

export const classKindMap = {
  r: 'table',
  p: 'table',
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

export const routineKindMap = {
  p: 'procedure',
  f: 'function',
  a: 'aggregate',

  // Not supported (yet):
  // w: 'windowFunction',
};
type RoutineKind = typeof routineKindMap[keyof typeof routineKindMap];

export type Kind = TypeKind | ClassKind | RoutineKind;

type PgType<K extends Kind = Kind> = {
  name: string;
  schemaName: string;
  kind: K;
  comment: string | null;
};

export default PgType;
