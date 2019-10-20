import { exec } from 'child_process';
import * as util from 'util';

const execute = util.promisify(exec);

export interface Options {
  url: string;
  folder: string;
}

export async function downloadPage(options: Options) {
  await executeCmd(
    `wget -E -H -p -k -e robots=off -P ${options.folder} ${options.url}`
  );

  await executeCmd(
    `sed -i'.bak' 's/href=\"commentfaces.html#/href=\"#/g' ${options.folder}/old.reddit.com/r/anime/wiki/commentfaces.html`
  );
}

async function executeCmd(command: string) {
  const { stdout, stderr } = await execute(command);
  console.log(stdout);
  console.error(stderr);
}
