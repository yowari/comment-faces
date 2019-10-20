#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';

import { downloadPage } from './download-page';
import { extractImages } from './extract';

const pkg = require('../../package.json');

const program = new Command();
program.version(pkg.version);

const localUrl = 'file://' + path.resolve(
    process.cwd(),
    './ranimes/old.reddit.com/r/anime/wiki/commentfaces.html'
  );

const externalUrl = 'https://old.reddit.com/r/anime/wiki/commentfaces';

const defaultFaceFolder = './faces-out';

const defaultPageFolder = './ranimes';

program.command('extract')
  .description('Extracts images and metadata corresponding for each comment face')
  .option('--url <url>', 'url of the wiki page containing comment faces', localUrl)
  .option('--faceFolder <path>', 'face folder', defaultFaceFolder)
  .action(extractImages);

program.command('download-page')
  .description('download comment faces reddit wiki page and save it locally')
  .option('--url <url>', 'url of the wiki page containing comment faces', externalUrl)
  .option('--folder <path>', 'folder to save images', defaultPageFolder)
  .action(downloadPage);

program.parse(process.argv);
