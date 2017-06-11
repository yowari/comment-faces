import { Client as DiscordBot } from 'discord.js';
import { Interpreter } from './src/interpreter';
import Help from './src/commands/help';

// TODO: Load .json file in a TypeScript way
const config = require('../config.json');

const bot = new DiscordBot();
const interpreter = new Interpreter(config);

// load commands
interpreter.commands['help'] = new Help();

bot.on('ready', () => {
  // set bot status message
  bot.user.setGame(`${config.prefix}help to display informations`);

  // MY BOTY IS READY
  console.log('comment-faces bot ready');
});

bot.on('message', message => {
  // leave the message to the interpreter
  interpreter.read(message);
});

bot.login(config.token);
