import * as fs from 'fs/promises';
import * as path from 'path';
import {cleanTree, parseUrl} from './docs';
import {docSectionToInterface} from './transformer';
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
})();
