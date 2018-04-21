import { Client } from 'discord.js';
import { Interpreter } from './interpreters/interpreter';
import { FaceCodeInterpreter } from './interpreters/facecode-interpreter';
import { CommandInterpreter } from './interpreters/command-interpreter';

import config from './config';

const bot = new Client();

// create interpreters
const interpreters: Interpreter[] = [
  new CommandInterpreter(config),
  new FaceCodeInterpreter(config),
];

bot.on('ready', () => {
  // set bot status message
  bot.user.setPresence({
    game: {
      name: `${config.prefix}help`,
    }
  });

  // MY BOTY IS READY
  console.log('comment-faces bot ready');
});

bot.on('message', message => {
  // leave the message to the interpreter
  for (let interpreter of interpreters) {
    const isMessageInterpreted = interpreter.read(message);

    if (isMessageInterpreted) {
      break;
    }
  }
});

bot.login(config.token);
