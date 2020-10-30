import {Section, SectionArgument, SectionChild} from './types';
import puppeteer from 'puppeteer';
import cheerio from 'cheerio';

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
const parseArguments = (
  $: cheerio.Root,
  root: cheerio.Cheerio
): SectionArgument[] => {
  return mapElements(root.find('> ul').first().find('> li'), element => {
    const name = $(element).find('.parameter').first().text();
    const info = rawText($(element));

    // console.log($(element).text(), $(element).find('> ul').length);

    // if ($(element).find('> ul').length > 0) {
    //   console.log('Children', parseArguments($, $(element)));
    // }

    const type =
      $(element).has('> ul').length > 0
        ? parseArguments($, $(element).siblings('> ul').first())
        : mapElements(
            $(element).siblings('.types').first().find('.type'),
            element => $(element).text()
          );

    return {
      nodeType: 'argument',
      name,
      children: type,
      information: info,
    } as SectionArgument;
  });
};

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

const parseDocs = (html: string): Section[] => {
  let data: [name: cheerio.Cheerio, body: cheerio.Cheerio][] = [];

  const $ = cheerio.load(html);

  data = mapElements($('.section-header'), element => [
    $(element).first(),
    $(element).next('.function').first(),
  ]);

  return data.map(([name, body]) => {
    const children: SectionArgument[] = groupBy($, body, 'dt', 'dd').map(
      ([_, propBody]) => {
        return parseArguments($, propBody);
      }
    );

    return {
      nodeType: 'section',
      name: $(name).text(),
      arguments: children,
      // description:
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
