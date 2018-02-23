import { ImageBuilder } from './builder';
//const Gm = require('gm');
import { ImageMetaExtractor } from './extractor';

class ImageRepository {

  metaExtractor : ImageMetaExtractor;

  constructor(public faceFolder: string) {
    this.metaExtractor = new ImageMetaExtractor('./ranimes/commentfaces - anime.html');
  }

  async getImage(faceCode: string, textOnTop: string): Promise<string> {
    const imgMeta = await this.metaExtractor.extract(faceCode);

    if (!imgMeta) {
      return Promise.reject(`No image found for \`${faceCode}\``);
    }

    const image = new ImageBuilder(imgMeta, this.faceFolder, faceCode);

    if (textOnTop !== '') {
      image.textOnTop = textOnTop;
    }

    return image.save();
  }

}

export { ImageRepository };
