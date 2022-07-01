export const typeKindMap = {
  d: 'domain',
  e: 'enum',
  r: 'range',
  m: 'multiRange',
} as const;
type TypeKind = typeof typeKindMap[keyof typeof typeKindMap];

export const classKindMap = {
  r: 'table',
  p: 'table',
  v: 'view',
  m: 'materializedView',
  c: 'compositeType',
} as const;
type ClassKind = typeof classKindMap[keyof typeof classKindMap];

export const routineKindMap = {
  p: 'procedure',
  f: 'function',
  a: 'aggregate',
  // Window functions are not included because they cannnot be user defined.
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
