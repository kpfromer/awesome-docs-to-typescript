import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import {DocSection, DocItem, DocTable, DocPrimitive} from './types';

const mapElements = <T>(
  elements: cheerio.Cheerio,
  func: (el: cheerio.Element) => T
): T[] => {
  const data: T[] = [];

  elements.each((i, el) => data.push(func(el)));

  return data;
};

const groupBy = (
  $: cheerio.Root,
  root?: cheerio.Cheerio,
  ...selectors: string[]
): cheerio.Cheerio[][] => {
  if (selectors.length === 0) {
    return [];
  }

  const [first, ...rest] = selectors;

  return !!root
    ? root
        .children()
        .toArray()
        .filter(element => $(element).is(first))
        .map(element => {
          const first = $(element);
          return [first, ...rest.map(selector => first.next(selector))];
        })
    : mapElements($(first), element => [
        $(element).first(),
        ...rest.map(selector => $(element).next(selector).first()),
      ]);

  // const groups: cheerio.Cheerio[][] = mapElements(
  //   $(root).find(first),
  //   element => {
  //     const first = $(element);
  //     return [first, ...rest.map(selector => first.next(selector))];
  //   }
  // );
  // return groups;
};

// const parseType = ($: cheerio.Root, element: cheerio.Element) => {
//   return mapElements(
//     $(propBody).find('.types').first().find('.type'),
//     element => $(element).text()
//   )
// }

const rawText = (element: cheerio.Cheerio) =>
  element.clone().children().remove().end().text();

const parseMetadata = (element: cheerio.Cheerio) => {
  return rawText(element)
    .trim()
    .replace(/\n\n */g, '\n')
    .split('\n')
    .map(line => line.trim());
};

/*
<ul>
  <li><span class="parameter">clockwise</span>
    True to cycle clients clockwise.
  </li>
  <li><span class="parameter">s</span>
    The screen where to cycle clients.
    (<em>optional</em>)
  </li>
  <li><span class="parameter">stacked</span>
      <span class="types"><span class="type">boolean</span></span>
    Use stacking order? (top to bottom)
    (<em>default</em> false)
  </li>
</ul>
*/
// const parseArguments = (
//   $: cheerio.Root,
//   root: cheerio.Cheerio
// ): SectionArgument[] => {
//   return mapElements(root.find('> ul').first().find('> li'), element => {
//     const name = $(element).find('.parameter').first().text();
//     const info = rawText($(element));

//     // console.log($(element).text(), $(element).find('> ul').length);

//     // if ($(element).find('> ul').length > 0) {
//     //   console.log('Children', parseArguments($, $(element)));
//     // }

//     const type =
//       $(element).has('> ul').length > 0
//         ? parseArguments($, $(element).siblings('> ul').first())
//         : mapElements(
//             $(element).siblings('.types').first().find('.type'),
//             element => $(element).text()
//           );

//     return {
//       nodeType: 'argument',
//       name,
//       children: type,
//       information: info,
//     } as SectionArgument;
//   });
// };

// const parseSectionChild = (
//   $: cheerio.Root,
//   propName: cheerio.Cheerio,
//   propBody: cheerio.Cheerio
// ): SectionChild => {
//   const name = $(propName).find('strong').text();

//   // console.log(parseArgs($(propBody)));

//   // console.log(
//   //   mapElements($(propBody).find('ul').first().find('li'), element => {
//   //     const name = $(element).find('.parameter').text();
//   //     const info = rawText($(element));
//   //     const type = mapElements(
//   //       $(propBody).find('.types').first().find('.type'),
//   //       element => $(element).text()
//   //     );
//   //     return {name, info, type};
//   //   })
//   // );

//   return {
//     nodeType: 'argument',
//     name,
//     children: mapElements(
//       $(propBody).find('.types').first().find('.type'),
//       element => $(element).text()
//     ),
//     metadata: parseMetadata(propBody),
//   };
// };

// const parseDocs = (html: string): Section[] => {
//   let data: [name: cheerio.Cheerio, body: cheerio.Cheerio][] = [];

//   const $ = cheerio.load(html);

//   data = mapElements($('.section-header'), element => [
//     $(element).first(),
//     $(element).next('.function').first(),
//   ]);

//   return data.map(([name, body]) => {
//     const children: SectionArgument[] = groupBy($, body, 'dt', 'dd').map(
//       ([_, propBody]) => {
//         return parseArguments($, propBody);
//       }
//     );

//     return {
//       nodeType: 'section',
//       name: $(name).text(),
//       arguments: children,
//       // description:
//     } as Section;
//   });
// };

// const cleanText = (string: string ): string => string.trim().replace()

const parseDocPrimitive = (
  $: cheerio.Root,
  element: cheerio.Cheerio
): DocPrimitive => {
  const name = $(element).find('> .parameter').text().trim();
  const types = $(element)
    .find('> .types > .type')
    .toArray()
    .map(element => $(element).text().trim());

  // if (types.length > 1)
  //   throw TypeError(`Invalid Doc Primitive. Length "${types.length}"`);

  return {
    nodeType: 'primitive',
    name,
    type: types,
  };
};
const parseDocTable = ($: cheerio.Root, element: cheerio.Cheerio): DocTable => {
  const name = $(element).find('> .parameter').text().trim();
  const table = parseDocSubItems($, $('> ul', element).children().toArray());

  const items = new Map<string, DocPrimitive | DocTable>();
  for (const child of table) {
    items.set(child.name, child);
  }

  return {nodeType: 'table', name, table: items};
};

const parseDocSubItems = (
  $: cheerio.Root,
  elements: cheerio.Element[]
): (DocPrimitive | DocTable)[] => {
  return elements.map(element => {
    if ($('> ul', element).length > 0) {
      // console.log($(element).find('.parameter').first().text().trim());
      return parseDocTable($, $(element));
    } else {
      return parseDocPrimitive($, $(element));
    }
  });
};

const parseDocItem = (
  $: cheerio.Root,
  title: cheerio.Cheerio,
  body: cheerio.Cheerio
): DocItem => {
  // parseDocSubItems($, $('> ul', body).toArray());

  // const subItems = $('> ul', body).toArray();
  // subItems.map(element => {
  //   if ($('> ul', element).length > 0) {
  //     // console.log($(element).find('.parameter').first().text().trim());
  //     return parseDocTable($, $(element));
  //   } else {
  //     return parseDocPrimitive($, $(element));
  //   }
  // });

  // console.log(`START"${title.text()}END"`);
  // const typesList = $('> ul', body)
  //   .toArray()
  //   .filter(el => $(el).prev().text() === 'Type:');
  // console.log({typesList});

  return {
    nodeType: 'item',
    // name: title.text(),
    name: title.find('> strong').text(),
    arguments: parseDocSubItems($, $('> ul', body).children().toArray()),
    // arguments: typesList
    //   ? parseDocSubItems($, $(typesList[0]).children().toArray())
    //   : [],
  };
};
// const parseDocSection = (): DocSection => {};
const parsePage = (html: string): DocSection[] => {
  const $ = cheerio.load(html);
  return groupBy($, undefined, '.section-header', '.function').map(
    ([header, body]) => {
      // console.log(groupBy($, body, 'dt', 'dd'));
      return {
        nodeType: 'section',
        title: header.text().trim(),
        items: groupBy($, body, 'dt', 'dd').map(([title, body]) =>
          parseDocItem($, title, body)
        ),
      } as DocSection;
    }
  );
};

export const parseUrl = async (url: string): Promise<DocSection[]> => {
  const browser = await puppeteer.launch({headless: true});

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});

  try {
    const sections = parsePage(
      await page.evaluate(() => document.body.innerHTML)
    );
    await page.close();
    await browser.close();

    return sections;
  } catch {
    await page.close();
    await browser.close();

    return [] as DocSection[];
  }
};

// export const cleanTree = (section: DocSection): void => {
//   const cleanItem = (
//     item: DocPrimitive | DocTable
//   ): DocPrimitive | DocTable | boolean => {
//     if (item.nodeType === 'primitive') {
//       return !!item.name;
//     } else {
//       const {table, ...rest} = item;
//       const newMap = new Map<string, DocPrimitive | DocTable>();
//       Array.from(table.entries()).filter(([key, value]) => !!key)
//     }
//   };
//   section.items.map(item => {
//     item.arguments;
//   });
// };
