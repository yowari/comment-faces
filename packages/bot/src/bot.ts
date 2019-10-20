import { Client, Message } from 'discord.js';

import { CommandInterpreter } from './command/command.interpreter';
import { HelpCommand } from './command/help.command';
import { CommentFaceInterpreter } from './comment-face/comment-face.interpreter';
import { Interpreter } from './common/interpreter';
import { ImageRepository } from './image/image-repository';

export interface BotOptions {
  prefix: string;
}

export class Bot {

  private readonly bot = new Client();

  private readonly interpreters: Interpreter[] = [];

  constructor(
    private readonly token: string,
    private readonly imageRepository: ImageRepository,
    private readonly options: BotOptions
  ) {
    this.interpreters.push(
      new CommandInterpreter(options.prefix, {
        help: new HelpCommand()
      }),
      new CommentFaceInterpreter(this.imageRepository, this.bot)
    );

    this.bot.on('ready', () => this.onReady());
    this.bot.on('message', (message) => this.onMessage(message));
  }

  start(): void {
    this.bot.login(this.token);
  }

  private onReady(): void {
    // set bot status message
    this.bot.user.setPresence({
      game: {
        name: `${this.options.prefix} help`
      }
    });

    console.log('My boty is ready');
  }

  private onMessage(message: Message): void {
    this.interpreters.find((interpreter) => interpreter.read(message));
  }

}
