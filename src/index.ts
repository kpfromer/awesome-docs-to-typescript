import * as fs from 'fs/promises';
import * as path from 'path';
import {cleanTree, parseUrl} from './docs';
import {Transformer} from './transformer';
import {visitInterfaceSection} from './visitor';
import prettier from 'prettier';

(async () => {
  const items = (
    await parseUrl('https://awesomewm.org/doc/api/classes/awful.wibar.html')
  )
    // await parseUrl('https://awesomewm.org/doc/api/classes/awful.button.html')
    // await parseUrl('https://awesomewm.org/doc/api/classes/client.html')
    .map(cleanTree);
  // console.dir(items, {depth: null});

  const transformer = new Transformer();

  items.map(item => transformer.add(item));

  // console.dir(transformer.interfaces(), {depth: null});

  await fs.writeFile(
    path.join(process.cwd(), 'out.ts'),
    prettier.format(
      transformer
        .interfaces()
        .map(section => visitInterfaceSection(section))
        .join('\n')
    )
  );
})();
