import {
  BaseNode,
  FunctionDecl,
  InterfaceSection,
  RichComment,
  VariableType,
} from '../visitor/types';
import {DocItem, DocPrimitive, DocSection, DocTable} from '../docs/types';
import pascalcase from 'pascalcase';
import {parseName} from '../parser';

const convertType = (type: DocPrimitive | DocTable): VariableType => {
  if (type.nodeType === 'table') {
    return Array.from(type.table.entries()).reduce(
      (obj, [key, value]) => ({...obj, [key]: convertType(value)}),
      {}
    );
  }

  const types = type.type.filter(type => !!type);
  return types.length === 0 ? ['unknown'] : types;

  // return types.filter(type => !!type);
  // return types
  //   .map(type => {
  //     switch (type) {
  //       case 'integer':
  //         return 'number';
  //       case 'nil':
  //         return 'undefined';
  //       case '':
  //         return 'unknown';
  //       default:
  //         return type;
  //     }
  //   })
  //   .join(' | ');
};

const createComment = (value?: string[]): RichComment | undefined => {
  // TODO: fix on the parsing side
  if (value && value.some(item => !!item)) {
    return {
      body: value.filter(item => !!item),
      tags: [],
    };
  }

  return undefined;
};

// const isFunction = (name: string) => {
//   return name.includes('(') && name.includes(')');
// };

// const toFunctionDecl = (sectionBody: SectionBody): FunctionDecl => {
//   return {
//     nodeType: 'function',
//     comment: createComment(sectionBody.metadata),
//     name: sectionBody.name,
//     arguments: [],
//     // type: convertType(sectionBody.type),
//   };
// };

const docItemToBaseNode = (docItem: DocItem): BaseNode => {
  // TODO: awful.tag

  // checking if name indicates whether it's a function or just a property
  const parsedName = parseName(docItem.name);

  if (parsedName.type === 'name') {
    return {
      nodeType: 'property',
      comment: createComment(docItem.description?.split('\n')),
      name: parsedName.name,
      type: convertType(docItem.arguments[0]),
    };
  }

  // parsedName.argumentLayout
  return {
    nodeType: 'function',
    comment: createComment(docItem.description?.split('\n')),
    name: parsedName.name,
    arguments: docItem.arguments.map(arg => ({
      name: arg.name,
      type: convertType(arg),
    })),
  };
};

export const docSectionToInterface = (
  section: DocSection
): InterfaceSection => {
  return {
    name: `${pascalcase(section.title)}Interface`,
    items: section.items
      .filter(item => item.arguments.length > 0)
      .map(docItemToBaseNode),
  };
};
