import { Message } from 'discord.js';
import { Interpreter } from './interpreter';
import { ImageRepository } from '../image/repository';

interface FaceCodeExpr {
  textOnTop: string;
  faceCode: string;
  hoverText: string;
}

class CommentFaceInterpreter implements Interpreter {

  imgRepository: ImageRepository;

  constructor(public config: any) {
    this.imgRepository = new ImageRepository(config.tmp);
  }

  read(msg: Message): boolean {
    const expr: FaceCodeExpr | null = this.parse(msg.content);

    if (expr != null) {
      this.imgRepository.getImage(expr.faceCode, expr.textOnTop)
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
      return true;
    }

    return false;
  }

  parse(msgContent: string): FaceCodeExpr | null {
    const faceCodeExpr = /\[(.*)\]\(#([a-zA-Z0-9_-]+)(?:\s"(.*)")?\)/.exec(msgContent);

    if (faceCodeExpr == null) {
      return null;
    }

    let [, textOnTop, faceCode, hoverText] = faceCodeExpr;

    return {
      textOnTop,
      faceCode,
      hoverText
    };
  }

}

export { CommentFaceInterpreter };
