import fs from 'fs';
import path from 'path';
import config from './config';
import { getGithubImages } from './utils';

const OUTFILE = path.join(__dirname, '../images.json');

async function main(): Promise<void> {
  const images = await getGithubImages({
    user: config.images.user,
    repo: config.images.repo,
    treeSha: config.images.treeSha,
    imageFolders: config.images.imageFolders,
  });

  fs.writeFileSync(OUTFILE, JSON.stringify(images, null, 2));
}

main();