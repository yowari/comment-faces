import { Message } from 'discord.js';
import { Interpreter } from './interpreter';
import { Command } from '../commands/command';
import { Help } from '../commands/help';

export class CommandInterpreter implements Interpreter {

  commands: { [name: string]: Command };

  constructor(public config: any) {
    this.commands = {};
    // load commands
    this.commands['help'] = new Help();
  }

  read(msg: Message): boolean {
    if (msg.content.startsWith(this.config.prefix)) {
      const args = msg.content.slice(this.config.prefix.length).split(' ');
      const command = args.shift();

      if (command && command in this.commands) {
        this.commands[command].execute(msg, args);
        return true;
      }
      else {
        msg.reply('Command not found :frowning2:');
      }
    }

    return false;
  }

}