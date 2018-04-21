import { ImageBuilder } from './image-builder';
import { ImageMetaExtractor } from './image-extractor';

class ImageRepository {

  metaExtractor : ImageMetaExtractor;

  constructor(public faceFolder: string) {
    const url = './ranimes/www.reddit.com/r/anime/wiki/commentfaces.html';
    this.metaExtractor = new ImageMetaExtractor(url);
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
