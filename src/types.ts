// Documentation AST Related

type SectionType<T, B> = {nodeType: T} & B;

type SectIonPrimitive = SectionType<
  'primitive',
  {
    name: string;
    type: string[];
    information?: string;
  }
>;

export type SectionArgument = SectionType<
  'argument',
  {
    name: string;
    children: SectionChild[];
    information?: string;
  }
>;

export type SectionChild = SectionArgument | SectIonPrimitive;

export type Section = SectionType<
  'section',
  {
    name: string;
    arguments: SectionArgument[];
    description?: string;
    returns?: string;
    // seeAlso: string;
  }
>;

// AST Related

export type ASTNode<T, B = {}> = {nodeType: T} & B;

export type VariableType =
  | string[]
  | {
      [name: string]: VariableType;
    };

export type RichComment = {
  body: string[];
  tags: string[];
};

export type Property = ASTNode<
  'property',
  {
    comment?: RichComment;

    name: string;
    type: VariableType;
  }
>;

export type Argument = {
  // used for tag in rich comment of functiondecl
  comment?: string;

  name: string;
  type: VariableType;
};

export type FunctionDecl = ASTNode<
  'function',
  {
    comment?: RichComment;

    name: string;
    arguments: Argument[];
  }
>;

export type BaseNode = FunctionDecl | Property;

export type InterfaceSection = {
  name: string;
  items: BaseNode[];
};

// todo:
export type Nested = {};

/*

awful.wibar => 

interface wibar {

}

interface awful {
  wibar: wibar;
}


*/
