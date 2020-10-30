import {
  BaseNode,
  FunctionDecl,
  InterfaceSection,
  RichComment,
  Section,
  SectionBody,
  VariableType,
} from './types';
import pascalcase from 'pascalcase';

const convertType = (types: string[]): VariableType => {
  return types.filter(type => !!type);
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

const isFunction = (name: string) => {
  return name.includes('(') && name.includes(')');
};

const toFunctionDecl = (sectionBody: SectionBody): FunctionDecl => {
  return {
    nodeType: 'function',
    comment: createComment(sectionBody.metadata),
    name: sectionBody.name,
    arguments: [],
    // type: convertType(sectionBody.type),
  };
};

const sectionBodyToBaseNode = (sectionBody: SectionBody): BaseNode => {
  // TODO: awful.tag
  return {
    nodeType: 'property',
    comment: createComment(sectionBody.metadata),
    name: sectionBody.name,
    type: convertType(sectionBody.type),
  };
};

export const sectionToInterface = (section: Section): InterfaceSection => {
  return {
    name: `${pascalcase(section.name)}Interface`,
    items: section.body.map(sectionBodyToBaseNode),
  };
};
