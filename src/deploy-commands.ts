import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';

dotenv.config();

import { commands } from './commands';
import config from './config';

if (!config.token) {
  throw new Error('Please make sure you set the bot token');
}

const commandList = Object.keys(commands).map((name) => commands[name].command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

async function main(): Promise<void> {
  if (!config.clientId) {
    throw new Error('Please make sure you set the bot client id');
  }

  console.log('Started refreshing application commands (/)');
  await rest.put(Routes.applicationCommands(config.clientId), { body: commandList })
  console.log(`Successfully reloaded application commands (/)`);
}

main();
