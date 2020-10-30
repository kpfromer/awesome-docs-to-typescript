export type DocNode<T, B> = {nodeType: T} & B;

export type DocPrimitive = DocNode<
  'primitive',
  {
    name: string;
    type: string[];
    description?: string;
  }
>;

export type DocTable = DocNode<
  'table',
  {
    name: string;
    table: Map<string, DocPrimitive | DocTable>;
  }
>;

export type DocItem = DocNode<
  'item',
  {
    name: string;
    arguments: (DocPrimitive | DocTable)[];

    description?: string;
    returns?: string;
  }
>;

export type DocSection = DocNode<
  'section',
  {
    title: string;
    items: DocItem[];
  }
>;
