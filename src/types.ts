export type Index = { name: string; isPrimary: boolean };

export type TagMap = { [index: string]: string | boolean };

export type UpdateAction =
  | 'SET NULL'
  | 'SET DEFAULT'
  | 'RESTRICT'
  | 'NO ACTION'
  | 'CASCADE';

export type Reference = {
  schema: string;
  table: string;
  column: string;
  onDelete: UpdateAction;
  onUpdate: UpdateAction;
};

export type Column = {
  name: string;

  /** @deprecated use reference instead, this will be removed in the future */
  parent: string;

  reference?: Reference;
  indices: Index[];
  maxLength: number;
  nullable: boolean;
  defaultValue: any;
  isPrimary: boolean;
  type: string;
  comment: string;
  tags: TagMap;
  rawInfo: object;
};

export type TableOrView = {
  name: string;
  columns: Column[];
  comment: string;
  tags: TagMap;
};

export type Type = {
  name: string;
  type: string;
  values: string[];
  comment: string;
  tags: TagMap;
};

export type Schema = {
  tables: TableOrView[];
  views: TableOrView[];
  types: Type[];
};
