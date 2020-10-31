import pascalcase from 'pascalcase';
import {DocPrimitive, DocTable, DocItem, DocSection} from '../docs/types';
import {parseName} from '../parser';
import {
  VariableType,
  RichComment,
  BaseNode,
  InterfaceSection,
  Reference,
} from '../visitor/types';
import {UpdateMap} from './node-map';

export class Transformer {
  private interfaceMap = new Map<string, InterfaceSection>();

  constructor() {}

  private convertType(type: DocPrimitive | DocTable): VariableType {
    if (type.nodeType === 'table') {
      return Array.from(type.table.entries()).reduce(
        (obj, [key, value]) => ({...obj, [key]: this.convertType(value)}),
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
  }

  private createComment(value?: string[]): RichComment | undefined {
    // TODO: fix on the parsing side
    if (value && value.some(item => !!item)) {
      return {
        body: value.filter(item => !!item),
        tags: [],
      };
    }

    return undefined;
  }

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

  private getName(node: BaseNode): string {
    switch (node.nodeType) {
      case 'function':
        return node.name;
      case 'property':
        return node.name;
      case 'reference':
        return node.propertyName;
    }
  }

  private docItemToBaseNode(docItem: DocItem): BaseNode {
    // TODO: awful.tag

    // checking if name indicates whether it's a function or just a property
    const parsedName = parseName(docItem.name);

    if (parsedName.type === 'name') {
      return {
        nodeType: 'property',
        comment: this.createComment(docItem.description?.split('\n')),
        name: `'${parsedName.name}'`,
        type: this.convertType(docItem.arguments[0]),
      };
    }

    // it's a function

    if (parsedName.name.length === 0) {
      throw new TypeError();
    } else if (parsedName.name.length === 1) {
      return {
        nodeType: 'function',
        // todo:
        // comment: this.createComment(docItem.description?.split('\n')),
        comment: parsedName.isSelf
          ? {
              body: [],
              tags: ['noSelf'],
            }
          : undefined,
        name: parsedName.name[0],
        arguments: docItem.arguments.map(arg => ({
          name: arg.name,
          type: this.convertType(arg),
        })),
      };
    } else {
      console.log('IS SELF', parsedName.isSelf, docItem.name);
      // name = ["awful", "sub", "level"]
      const rootName = parsedName.name.pop()!;
      // name = ["level", "sub", "awful"]
      const levels = parsedName.name.reverse();
      // nested
      // Create new interface
      const reference = levels.reduce(
        (prevType, level) => {
          // if interface already exists use that, else create it
          let interfaceDefinition: InterfaceSection;

          const name = pascalcase(level);
          if (this.interfaceMap.has(name)) {
            interfaceDefinition = this.interfaceMap.get(name)!;
          } else {
            interfaceDefinition = {
              name,
              items: new UpdateMap(),
            } as InterfaceSection;
            this.interfaceMap.set(name, interfaceDefinition);
          }
          // Add previous type to interface
          interfaceDefinition.items.set(this.getName(prevType), prevType);

          // Create reference to that interface
          const reference: Reference = {
            nodeType: 'reference',
            propertyName: level,
            interfaceName: interfaceDefinition.name,
          };
          // Return reference
          return reference as BaseNode;
        },
        {
          nodeType: 'function',
          // todo: get working
          comment: parsedName.isSelf
            ? {
                body: [],
                tags: ['noSelf'],
              }
            : undefined,
          // TODO:
          // comment: this.createComment(docItem.description?.split('\n')),

          name: rootName,
          arguments: docItem.arguments.map(arg => ({
            name: arg.name,
            type: this.convertType(arg),
          })),
        } as BaseNode
      );

      // parsedName.argumentLayout
      return reference;
    }
  }

  private visitDocSection(section: DocSection): void {
    const name = `${pascalcase(section.title)}Interface`;
    const items = section.items
      .filter(item => item.arguments.length > 0)
      .map(item => {
        const node = this.docItemToBaseNode(item);
        return [this.getName(node), node];
      }) as [string, BaseNode][];

    this.interfaceMap.set(name, {
      name,
      items: new UpdateMap(items),
    });
  }

  public interfaces(): InterfaceSection[] {
    return Array.from(this.interfaceMap.values());
  }

  public add(section: DocSection): this {
    this.visitDocSection(section);
    return this;
  }
}
