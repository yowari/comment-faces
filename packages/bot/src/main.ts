import dotenv from 'dotenv';
import * as path from 'path';

import { Bot } from './bot';
import { ImageRepository } from './image/image-repository';

async function main() {
  dotenv.config();

  const token = process.env.TOKEN;

  if (!token) {
    throw new Error('No Discord bot token provided');
  }

  const facesFolder = path.resolve(__dirname, '../faces-out');

  const imageRepository = new ImageRepository(facesFolder);
  console.log('loading images...');

  const bot = new Bot(token, imageRepository, { prefix: '!cf' });
  console.log('starting bot...');
  bot.start();
}

main();
