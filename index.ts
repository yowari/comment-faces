import { Client } from 'discord.js';
import { Interpreter } from './src/interpreter';
import Help from './src/commands/help';
import Config from './src/common/config';

// TODO: Load .json file in a TypeScript way
const userConfig = require('../config.json');
const token: string = process.env.TOKEN;

const config: Config = Object.assign({}, userConfig, {
  token
});

const bot = new Client();
const interpreter = new Interpreter(config);

// load commands
interpreter.commands['help'] = new Help();

bot.on('ready', () => {
  // set bot status message
  bot.user.setPresence({
    game: {
      name: `${config.prefix}help`,
      type: 0
    }
  });

  // MY BOTY IS READY
  console.log('comment-faces bot ready');
});

bot.on('message', message => {
  // leave the message to the interpreter
  interpreter.read(message);
});

bot.login(config.token);
