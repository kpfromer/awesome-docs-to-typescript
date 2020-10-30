// import {
//   Argument,
//   BaseNode,
//   FunctionDecl,
//   InterfaceSection,
//   Property,
//   RichComment,
//   VariableType,
// } from './types';

// export class Visitor {
//   private interfaces = new Map<string, InterfaceSection>();

//   constructor(public readonly root: InterfaceSection) {}

//   private visitRichComment(comment: RichComment): string | undefined {
//     console.log(comment);
//     if (comment.body.length === 0 && comment.tags.length === 0) {
//       return undefined;
//     }

//     const bodyContent = comment.body.reduce(
//       (prev, curr) => `${prev}\n* ${curr}`,
//       ''
//     );
//     const tagContent = comment.tags.reduce(
//       (prev, curr) => `${prev}\n* @${curr}`,
//       ''
//     );

//     return `/**${bodyContent}\n*\n${tagContent}*/`;
//   }

//   private visitVariableType(type: VariableType): string {
//     if (Array.isArray(type)) {
//       if (type.length === 0) return 'unknown';

//       return type
//         .map(value => {
//           switch (value) {
//             case 'integer':
//               return 'number';
//             case 'nil':
//               return 'undefined';
//             case '':
//               return 'unknown';
//             default:
//               return value;
//           }
//         })
//         .join(' | ');
//     }

//     console.log(type, Object.entries(type));

//     const items = Object.entries(type).map(
//       ([key, values]) => `${key}: ${this.visitVariableType(values)}`
//     );

//     // const items = Object.entries(type).map(
//     //   ([key, values]) => `${key}: ${values.map(visitVariableType)}`
//     // );

//     return `{\n${items.join(', ')}\n}`;

//     // return `{\n${Object.entries(type)
//     //   .map(([key, value]) => `${key}: ${value.map(visitVariableType)}`)
//     //   .join(',\n')}\n}`;
//   }

//   private visitProperty(prop: Property): string {
//     let string = `${prop.name}: ${this.visitVariableType(prop.type)};`;

//     return prop.comment
//       ? `${this.visitRichComment(prop.comment)}\n${string}`
//       : string;
//   }

//   private visitArgument(arg: Argument): string {
//     return `${arg.name}: ${this.visitVariableType(arg.type)}`;
//   }

//   private visitFunctionDecl(func: FunctionDecl): string {
//     return `'${func.name}': (${func.arguments
//       .map(this.visitArgument)
//       .join(',')}) => any;`;
//   }

//   private visitBaseNode(node: BaseNode): string {
//     if (node.nodeType === 'property') {
//       return this.visitProperty(node);
//     } else {
//       return this.visitFunctionDecl(node);
//     }
//   }

//   private visitInterfaceSection(interfaceSection: InterfaceSection): string {
//     console.log(interfaceSection.items.map(this.visitBaseNode));
//     return `interface ${interfaceSection.name} {\n${interfaceSection.items
//       .map(this.visitBaseNode)
//       .join('\n')}\n}`;
//   }

//   public visit(): string {
//     return this.visitInterfaceSection(this.root);
//   }
// }

export const a = () => {};
