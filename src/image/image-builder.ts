import * as fs from 'fs';
import * as path from 'path';
// TypeScript Definition error when using Gm() and gm.in() in lines 125 and 128
import Gm from 'gm';
import { ImageMeta } from './image-extractor';

const TOP_POSITION = 20;
const FONT = __dirname + '/../../../font/Anton/Anton-Regular.ttf';
const FONT_SIZE = 20;
const FONT_FILL = '#FFF';
const STROKE_COLOR = '#000';
const STROKE_WEIGHT = 2;

class ImageBuilder {

  textOnTop?: string;
  animated: boolean;

  constructor(public imgMeta: ImageMeta,
    public filedir: string,
    public filename: string) {
    this.animated = (typeof this.imgMeta.animation !== 'undefined');
  }

  async save(): Promise<string> {
    if (!fs.existsSync(this.filedir)) {
      fs.mkdirSync(this.filedir);
    }

    let file = path.join(this.filedir, `${this.filename}`);

    let image: Gm.State;

    if (!this.animated) {
      file += '.png';

      image = this.buildImage(this.imgMeta);
    }
    else {
      file += '.gif';

      image = await this.buildAnimatedImage(this.imgMeta);
    }

    return new Promise<string>((resolve, reject) => {
      image.write(file, err => {
        if (err) {
          reject(err);
        }

        resolve(file);
      });
    });
  }

  buildImage(imgMeta: ImageMeta): Gm.State {
    let img = Gm(imgMeta.filePath)
        .crop(imgMeta.width, imgMeta.height, imgMeta.x, imgMeta.y);

    if (typeof this.textOnTop !== 'undefined') {
      img = img.font(FONT, FONT_SIZE)
        .fill(FONT_FILL)
        .stroke(STROKE_COLOR, STROKE_WEIGHT)
        .drawText(0, TOP_POSITION, this.textOnTop, 'north');
    }

    return img;
  }

  async buildAnimatedImage(imgMeta: ImageMeta): Promise<Gm.State> {
    if (typeof imgMeta.animation === 'undefined') {
      throw new Error('Animation data not found');
    }

    let file = path.join(this.filedir, `${this.filename}`);

    const widthStep = (imgMeta.animation.to.x - imgMeta.animation.from.x) / imgMeta.animation.steps;
    const heightStep = (imgMeta.animation.to.y - imgMeta.animation.from.y) / imgMeta.animation.steps;

    let imgPromises = [];

    for (let i = 0; i <= imgMeta.animation.steps; i++) {
      imgPromises.push(new Promise<string>((resolve, reject) => {
        if (typeof imgMeta.animation === 'undefined') {
          reject('Animation data not found');
          return;
        }

        this.buildImage({
          filePath: imgMeta.filePath,
          width: imgMeta.width,
          height: imgMeta.height,
          x: imgMeta.animation && imgMeta.animation.from.x + (widthStep * i),
          y: imgMeta.animation && imgMeta.animation.from.y + (heightStep * i)
        })
        .write(`${file}-${i+1}.png`, err => {
          if (err) {
            reject(err);
          }

          resolve(`${file}-${i+1}.png`);
        });
      }));
    }

    let frames = await Promise.all(imgPromises);
    let gm = Gm(imgMeta.width, imgMeta.height);
    gm.repage("+");

    for (let frame of frames) {
      // Perhaps this should be fixed in @types/gm
      // @ts-ignore
      gm = gm.in(frame);
    }

    gm = gm.delay(imgMeta.animation.duration / (imgMeta.animation.steps + 1));
    gm = gm.resize(imgMeta.width, imgMeta.height);

    return gm;
  }

}

export { ImageBuilder };