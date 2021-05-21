export type Index = { name: string; isPrimary: boolean };

export type TagMap = { [index: string]: string | boolean };

export type UpdateAction =
  | 'SET NULL'
  | 'SET DEFAULT'
  | 'RESTRICT'
  | 'NO ACTION'
  | 'CASCADE';

export type GenerationType = 'ALWAYS' | 'BY DEFAULT' | 'NEVER';

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
  isIdentity: boolean;
  isArray: boolean;
  generated: GenerationType;
  isUpdatable: boolean;
  type: string;
  subType: string;
  comment: string;
  tags: TagMap;
  rawInfo: object;
};

export type Attribute = {
  name: string;

  maxLength: number;
  nullable: boolean;
  defaultValue: any;
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

export type Type = EnumType | CompositeType;

export type EnumType = {
  name: string;
  type: 'enum';
  values: string[];
  comment: string;
  tags: TagMap;
};

export type CompositeType = {
  name: string;
  type: 'composite';
  attributes: Attribute[];
  comment: string;
  tags: TagMap;
};

export type Schema = {
  tables: TableOrView[];
  views: TableOrView[];
  types: Type[];
};
