import * as fs from 'fs';
import Gm from 'gm';
import * as path from 'path';

const TOP_POSITION = 20;
const FONT = path.resolve(__dirname, '../font/Anton/Anton-Regular.ttf');
const FONT_SIZE = 20;
const FONT_FILL = '#FFF';
const STROKE_COLOR = '#000';
const STROKE_WEIGHT = 2;

export class ImageBuilder {

  async saveImage(image: Gm.State, filename: string): Promise<string> {
    const dirname = path.dirname(filename);

    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname);
    }

    return new Promise<string>((resolve, reject) => {
      image.write(filename, (err) => {
        if (err) {
          reject(err);
        }

        resolve(filename);
      });
    });
  }

  buildImage(file: string, x: number, y: number, width: number, height: number): Gm.State {
    const image = Gm(file)
      // .gravity('Center')
      .crop(width, height, x, y, false);

    return image;
  }

}
