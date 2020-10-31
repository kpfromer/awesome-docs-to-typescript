import {
  Argument,
  BaseNode,
  FunctionDecl,
  InterfaceSection,
  Property,
  Reference,
  RichComment,
  VariableType,
} from './types';

// AST Related

const joinComment = (value: string, comment?: string): string => {
  if (comment) {
    return `${comment}\n${value}`;
  }
  return value;
};

const visitRichComment = (comment: RichComment): string | undefined => {
  if (comment.body.length === 0 && comment.tags.length === 0) {
    return undefined;
  }

  const lines = [...comment.body, ...comment.tags.map(tag => `@${tag}`)].reduce(
    (prev, line) => `${prev}\n* ${line}`,
    ''
  );

  return `/**${lines}\n*/`;
};

const visitVariableType = (type: VariableType): string => {
  if (Array.isArray(type)) {
    if (type.length === 0) return 'unknown';

    return type
      .map(value => {
        switch (value) {
          case 'integer':
            return 'number';
          case 'nil':
            return 'undefined';
          case '':
            return 'unknown';
          default:
            return value;
        }
      })
      .join(' | ');
  }

  const items = Object.entries(type).map(
    ([key, values]) => `${key}: ${visitVariableType(values)}`
  );

  return `{\n${items.join(', ')}\n}`;
};

const visitProperty = (prop: Property): string => {
  const string = `${prop.name}: ${visitVariableType(prop.type)};`;

  return prop.comment ? `${visitRichComment(prop.comment)}\n${string}` : string;
};

const visitArgument = (arg: Argument): string => {
  // TODO: fix arg.comment type
  return joinComment(
    `${arg.name}: ${visitVariableType(arg.type)}`,
    arg.comment ? arg.comment : undefined
  );
};

const visitFunctionDecl = (func: FunctionDecl): string => {
  return joinComment(
    `'${func.name}': (${func.arguments
      .map(visitArgument)
      .join(',')}) => unknown;`,
    func.comment ? visitRichComment(func.comment) : undefined
  );
};

const visitReference = (reference: Reference): string => {
  return `${reference.propertyName}: ${reference.interfaceName};`;
};

export const visitBaseNode = (node: BaseNode): string => {
  if (node.nodeType === 'property') {
    return visitProperty(node);
  } else if (node.nodeType === 'function') {
    return visitFunctionDecl(node);
  } else if (node.nodeType === 'reference') {
    return visitReference(node);
  }

  throw new Error();
};

export const visitInterfaceSection = (
  interfaceSection: InterfaceSection
): string => {
  const interfaceItems = Array.from(interfaceSection.items.values()).map(
    visitBaseNode
  );

  return `interface ${interfaceSection.name} {\n${interfaceItems.join(
    '\n'
  )}\n}`;
};
