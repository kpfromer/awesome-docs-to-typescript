// Documentation Related

export type SectionBody = {
  name: string;
  type: string[];
  metadata?: string[];
};

export type Section = {
  name: string;
  body: SectionBody[];
};

// AST Related

export type ASTNode<T, B = {}> = {type: T} & B;

export type VariableType = string;

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

export type InterfaceSection = {
  items: (FunctionDecl | Property)[];
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
