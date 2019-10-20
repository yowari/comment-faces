import { Message } from 'discord.js';

export interface Interpreter {
  read(message: Message): boolean;
}
