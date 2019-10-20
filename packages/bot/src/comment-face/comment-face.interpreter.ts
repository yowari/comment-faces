import { Client, Message } from 'discord.js';

import { Interpreter } from '../common/interpreter';
import { ImageRepository } from '../image/image-repository';

// regex used to extract comment face code, hover text and text on top
const COMMENTFACE_FORMAT = /\[(.*)\]\(#([a-zA-Z0-9_-]+)(?:\s"(.*)")?\)/;

interface CommentFace {
  faceCode: string;
  textOnTop: string;
  hoverText: string;
}

/**
 * Interpreter used to read and respond when a user send a message in the
 * channel with a face
 */
export class CommentFaceInterpreter implements Interpreter {

  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly bot: Client
  ) {

  }

  /**
   * Read message and respond to channel with the image corresponding to the
   * comment face
   * @param message message sent to the channel
   * @returns true if the message is interpreted
   */
  read(message: Message): boolean {
    // don't read a message sent by the bot itself
    if (message.author.id === this.bot.user.id) {
      return false;
    }

    try {
      const face = this.parse(message.content);

      // message don't containe a comment face
      if (!face) {
        return false;
      }

      // find corresponding image to the comment face
      const imageFile = this.imageRepository.getImage(face.faceCode);

      message.channel.send('', {
        files: [imageFile]
      });

      return true;
    } catch (e) {
      message.channel.send('', {
        embed: {
          color: 0xFF0000,
          title: 'Error',
          description: e.message
        }
      });

      return false;
    }
  }

  /**
   * Parses the text message and extracts the faceCode, textOnTop and the
   * hoverText
   * @param text text message
   * @returns Face informations or null if text don't container comment face code
   */
  private parse(text: string): CommentFace | null {
    // execute regex to extract face code
    const faceExpr = COMMENTFACE_FORMAT.exec(text);

    // text entered does not correspond to the comment face format
    if (!faceExpr) {
      return null;
    }

    const [, textOnTop, faceCode, hoverText] = faceExpr;

    return {
      faceCode,
      textOnTop,
      hoverText
    };
  }

}
