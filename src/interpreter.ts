import { Message, TextChannel, DMChannel, GroupDMChannel } from 'discord.js';
import Config from './common/config';
import { ImageExtractor } from './extractor';

class Interpreter {

  commands: { [name: string]: Command };
  parser: Parser;
  extractor: ImageExtractor;

  constructor(public config: Config) {
    this.commands = {};
    this.parser = new Parser();
    this.extractor = new ImageExtractor(config.faceFolder);
  }

  read(msg: Message): void {
    if (msg.content.startsWith(this.config.prefix)) {
      const args = msg.content.slice(this.config.prefix.length).split(' ');
      const command = args.shift();

      if (command && command in this.commands) {
        this.commands[command].execute(msg, args);
      }
      else {
        msg.reply('Command not found :frowning2:');
      }
    }
    else {
      const expr: Expr | null = this.parser.parse(msg);
      
      if (expr != null) {
        switch (expr.kind) {
        case 'facecode':
          this.extractor.getImage(expr.faceCode, expr.textOnTop)
            .then(imageFile => {
              if (imageFile != null) {
                msg.channel.send('', {
                  files: [ imageFile ]
                });
              }
            })
            .catch(reason => {
              console.error(reason);
              msg.channel.send('', {
                embed: {
                  color: 0xFF0000,
                  title: 'Error',
                  description: reason
                }
              });
            });
          break;
        }
      }
    }
  }

}

interface Command {
  execute(msg: Message, args: string[]): void;
}

type Expr = FaceCodeExpr;

interface FaceCodeExpr {
  kind: 'facecode',
  textOnTop: string;
  faceCode: string;
  hoverText: string;
}

class Parser {

  parse(msg: Message): Expr | null {
    const faceCodeExpr = /\[(.*)\]\(#([a-zA-Z0-9_-]+)(?:\s"(.*)")?\)/.exec(msg.content);

    if (faceCodeExpr == null) {
      return null;
    }

    let [, textOnTop, faceCode, hoverText] = faceCodeExpr;

    return {
      kind: 'facecode',
      textOnTop,
      faceCode,
      hoverText
    };
  }

}

export { Interpreter, Command };
