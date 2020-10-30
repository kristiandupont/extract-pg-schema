export type Index = { name: string; isPrimary: boolean };

export type TagMap = { [index: string]: string | boolean };

export type Column = {
  name: string;
  parent: string;
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
