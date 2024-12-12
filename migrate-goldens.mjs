import * as fs from 'fs/promises';
import * as path from 'path';

async function run() {
  for await (const goldenPath of fs.glob('src/**/goldens/*.golden')) {
    console.log(goldenPath);
    const raw = await fs.readFile(goldenPath, {encoding: 'utf8'});
    const parsed = JSON.parse(raw);
    const type = parsed.type;
    if (type !== 'element') {
      console.warn(`${goldenPath} has type ${type}`);
      continue;
    }

    const newPath = path.join(
      path.dirname(goldenPath),
      `${parsed['name']}.html`,
    );
    console.log('newPath', newPath);
    await fs.writeFile(newPath, parsed.raw, {
      encoding: 'utf8',
    });
    fs.rm(goldenPath);
  }
}

run();
