import { Message } from 'discord.js';

interface Interpreter {
    read(msg: Message): boolean;
}

export { Interpreter };