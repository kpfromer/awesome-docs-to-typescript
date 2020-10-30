import * as fs from 'fs/promises';
import * as path from 'path';
import {cleanTree, parseUrl} from './docs';
import {docSectionToInterface} from './transformer/df';
import {visitInterfaceSection} from './visitor';

(async () => {
  const items = (
    await parseUrl('https://awesomewm.org/doc/api/classes/awful.wibar.html')
  ).map(cleanTree);
  console.dir(items, {depth: null});

  const parsed = docSectionToInterface(items[0]);
  console.dir(parsed, {depth: null});

  await fs.writeFile(
    path.join(process.cwd(), 'out.ts'),
    visitInterfaceSection(parsed)
  );

  // const sections = await parseUrl(
  //   'https://awesomewm.org/doc/api/classes/awful.wibar.html'
  //   // 'https://awesomewm.org/doc/api/classes/wibox.widget.textbox.html'
  // );

  // await fs.writeFile(
  //   path.join(process.cwd(), 'file.json'),
  //   JSON.stringify(sections)
  // );

  // await fs.writeFile(
  //   path.join(process.cwd(), 'doc.ts'),
  //   visitSection(
  //     sections.filter(section => section.name === 'Object properties').pop()!
  //   )
  // );

  // console.dir(sectionToInterface(sections.pop()!), {depth: null});

  // console.log(visitBaseNode(sectionToInterface(sections[2]).items[0]));
  // await fs.writeFile(
  //   path.join(process.cwd(), 'doc.ts'),
  //   sections.map(visitSection).join('\n\n\n')
  // );
})();
