// AST Related

export type ASTNode<T, B = {}> = {nodeType: T} & B;

export type Reference = ASTNode<
  'reference',
  {
    propertyName: string;
    interfaceName: string;
  }
>;

export type VariableType =
  | string[]
  | Reference
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

export type BaseNode = FunctionDecl | Property | Reference;

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
