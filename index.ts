import { Client } from 'discord.js';
import { Interpreter, CommandInterpreter, CommentFaceInterpreter } from './src/interpreters';

import config from './src/config';

const bot = new Client();

// create interpreters
const interpreters: Interpreter[] = [
  new CommandInterpreter(config),
  new CommentFaceInterpreter(config),
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
