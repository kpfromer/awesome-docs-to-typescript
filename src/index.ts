import * as fs from 'fs/promises';
import * as path from 'path';
import {parseUrl} from './parse-docs';
import {visitSection} from './visitor';

(async () => {
  const sections = await parseUrl(
    'https://awesomewm.org/doc/api/classes/awful.wibar.html'
    // 'https://awesomewm.org/doc/api/classes/wibox.widget.textbox.html'
  );

  await fs.writeFile(
    path.join(process.cwd(), 'file.json'),
    JSON.stringify(sections)
  );

  await fs.writeFile(
    path.join(process.cwd(), 'doc.ts'),
    visitSection(
      sections.filter(section => section.name === 'Object properties').pop()!
    )
  );

  // await fs.writeFile(
  //   path.join(process.cwd(), 'doc.ts'),
  //   sections.map(visitSection).join('\n\n\n')
  // );
})();
