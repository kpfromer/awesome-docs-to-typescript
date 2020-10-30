import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import {DocSection, DocItem, DocTable, DocPrimitive} from './types';
import {groupBy, matchBy} from './helper';

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

  // todo:
  // console.log(
  //   matchBy($, undefined, 'h3', 'ul', header =>
  //     header.text().trim().toLowerCase()
  //   )
  // );

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

export const cleanTree = (section: DocSection): DocSection => {
  const cleanItem = (
    item: DocPrimitive | DocTable
  ): DocPrimitive | DocTable | undefined => {
    if (item.nodeType === 'primitive' && !!item.name) {
      // make a copy
      return {
        ...item,
        type: [...item.type],
      };
    } else if (item.nodeType === 'table') {
      const {table, ...rest} = item;
      const newTable = Array.from(table.entries()).reduce(
        (newMap, [key, value]) => {
          const newValue = cleanItem(value);
          if (newValue) {
            newMap.set(key, value);
          }
          return newMap;
        },
        new Map<string, DocPrimitive | DocTable>()
      );
      return {
        ...rest,
        table: newTable,
      };
    }

    return undefined;
  };
  return {
    nodeType: 'section',
    title: section.title,
    items: section.items.map(
      item =>
        ({
          ...item,
          arguments: item.arguments
            .map(cleanItem)
            .filter(item => item !== undefined),
        } as DocItem)
    ),
  };
};
