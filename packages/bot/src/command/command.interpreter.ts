import { Message } from 'discord.js';

import { Command } from './command';
import { Interpreter } from '../common/interpreter';

export class CommandInterpreter implements Interpreter {

  constructor(
    private readonly prefix: string,
    private readonly commands: { [name: string]: Command }
  ) {
  }

  read(message: Message): boolean {
    if (message.content.startsWith(this.prefix)) {
      const args = message.content.slice(this.prefix.length + 1).split(' ');
      const command = args.shift();

      if (command && command in this.commands) {
        this.commands[command].execute(message, args);
        return true;
      } else {
        message.reply('Command not found :frowning2:');
      }
    }

    return false;
  }

}
