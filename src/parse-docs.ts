import {Section, SectionBody} from './types';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const mapElements = <T>(
  elements: cheerio.Cheerio,
  func: (el: cheerio.Element) => T
): T[] => {
  const data: T[] = [];

  elements.each((i, el) => data.push(func(el)));

  return data;
};

// const groupByPair = (
//   $: cheerio.Root,
//   element: cheerio.Cheerio,
//   first: string,
//   second: string
// ): [first: cheerio.Cheerio, second: cheerio.Cheerio][] => {
//   const pairs: [first: cheerio.Cheerio, second: cheerio.Cheerio][] = [];

//   $(element)
//     .find(first)
//     .each((index, item) => {
//       const secondItem = $(item).next(second).first();
//       pairs.push([$(item), secondItem]);
//     });

//   return pairs;
// };

const groupBy = (
  $: cheerio.Root,
  element: cheerio.Cheerio,
  ...selectors: string[]
): cheerio.Cheerio[][] => {
  if (selectors.length === 0) {
    return [];
  }

  const [first, ...rest] = selectors;

  const groups: cheerio.Cheerio[][] = mapElements(
    $(element).find(first),
    element => {
      const first = $(element);
      return [first, ...rest.map(selector => first.next(selector))];
    }
  );
  return groups;
};

const parseDocs = (html: string): Section[] => {
  let data: [name: cheerio.Cheerio, body: cheerio.Cheerio][] = [];

  const $ = cheerio.load(html);

  data = mapElements($('.section-header'), element => [
    $(element).first(),
    $(element).next('.function').first(),
  ]);

  return data.map(([name, body]) => {
    const sectionBody: SectionBody[] = groupBy($, body, 'dt', 'dd').map(
      ([propName, propBody]) => {
        const name = $(propName).find('strong').text();
        return {
          name,
          type: mapElements(
            $(propBody).find('.types').first().find('.type'),
            element => $(element).text()
          ),
          metadata: $(propBody)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()
            .replace(/\n\n */g, '\n')
            .split('\n'),
        };
      }
    );

    return {
      name: $(name).text(),
      body: sectionBody,
    } as Section;
  });
};

export const parseUrl = async (url: string) => {
  const browser = await puppeteer.launch({headless: true});

  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle2'});

  const sections = parseDocs(
    await page.evaluate(() => document.body.innerHTML)
  );

  await page.close();
  await browser.close();

  return sections;
};
