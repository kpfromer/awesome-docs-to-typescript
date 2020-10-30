import {
  Argument,
  BaseNode,
  FunctionDecl,
  InterfaceSection,
  Property,
  RichComment,
  VariableType,
} from './types';

// Documentation AST Related
// export const visitDocType = (type: string) => {
//   switch (type) {
//     case 'integer':
//       return 'number';
//     case 'nil':
//       return 'undefined';
//     case '':
//       return 'unknown';
//     default:
//       return type;
//   }
// };

// export const visitSectionBody = ({
//   name,
//   type,
//   metadata,
// }: SectionBody): string => {
//   const typeString =
//     type.length > 0 ? type.map(visitDocType).join(' | ') : 'unknown';

//   const metadataString = metadata?.reduce(
//     (prev, curr) => `${prev}\n*${curr}`,
//     ''
//   );

//   return `/**${metadataString}\n*/\n${name}: ${typeString};`;
// };

// export const visitSection = ({name, body}: Section): string => {
//   const bodyString = body.map(visitSectionBody).join('\n\n');
//   return `interface ${name.replace(/\s+/g, '_')}Type \n{${bodyString}\n}`;
// };

// AST Related

const visitRichComment = (comment: RichComment): string | undefined => {
  console.log(comment);
  if (comment.body.length === 0 && comment.tags.length === 0) {
    return undefined;
  }

  const bodyContent = comment.body.reduce(
    (prev, curr) => `${prev}\n* ${curr}`,
    ''
  );
  const tagContent = comment.tags.reduce(
    (prev, curr) => `${prev}\n* @${curr}`,
    ''
  );

  return `/**${bodyContent}\n*\n${tagContent}*/`;
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

  console.log(type, Object.entries(type));

  const items = Object.entries(type).map(
    ([key, values]) => `${key}: ${visitVariableType(values)}`
  );

  // const items = Object.entries(type).map(
  //   ([key, values]) => `${key}: ${values.map(visitVariableType)}`
  // );

  return `{\n${items.join(', ')}\n}`;

  // return `{\n${Object.entries(type)
  //   .map(([key, value]) => `${key}: ${value.map(visitVariableType)}`)
  //   .join(',\n')}\n}`;
};

const visitProperty = (prop: Property): string => {
  let string = `${prop.name}: ${visitVariableType(prop.type)};`;

  return prop.comment ? `${visitRichComment(prop.comment)}\n${string}` : string;
};

const visitArgument = (arg: Argument): string => {
  return `${arg.name}: ${visitVariableType(arg.type)}`;
};

const visitFunctionDecl = (func: FunctionDecl): string => {
  return `'${func.name}': (${func.arguments
    .map(visitArgument)
    .join(',')}) => any;`;
};

export const visitBaseNode = (node: BaseNode): string => {
  if (node.nodeType === 'property') {
    return visitProperty(node);
  } else {
    return visitFunctionDecl(node);
  }
};

export const visitInterfaceSection = (
  interfaceSection: InterfaceSection
): string => {
  console.log(interfaceSection.items.map(visitBaseNode));
  return `interface ${interfaceSection.name} {\n${interfaceSection.items
    .map(visitBaseNode)
    .join('\n')}\n}`;
};
