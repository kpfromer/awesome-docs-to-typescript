const mapElements = <T>(
  elements: cheerio.Cheerio,
  func: (el: cheerio.Element) => T
): T[] => {
  const data: T[] = [];

  elements.each((i, el) => data.push(func(el)));

  return data;
};

export const groupBy = (
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
};

export const matchBy = (
  $: cheerio.Root,
  root: cheerio.Cheerio | undefined,
  first: string,
  second: string,
  toString: (element: cheerio.Cheerio) => string
): {[key: string]: cheerio.Cheerio} => {
  return groupBy($, root, first, second).reduce(
    (prev, [first, second]) => ({...prev, [toString(first)]: second}),
    {} as {[key: string]: cheerio.Cheerio}
  );
};
