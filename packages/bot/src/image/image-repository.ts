import * as fs from 'fs';
import * as path from 'path';

import { ImageBuilder } from '@comment-faces/builder';
import { RedditPageParser } from '@comment-faces/extractor';

import { ImageNotFoundError } from './image-not-found.error';

export class ImageRepository {

  constructor(private readonly faceFolder: string) {
  }

  /**
   * Find image corresponding to the provided face code
   * @param faceCode the image face code to retrieve
   */
  getImage(faceCode: string): string {
    // TODO: load gifs
    const file = path.join(this.faceFolder, faceCode + '.png');

    if (!fs.existsSync(file)) {
      throw new ImageNotFoundError('No image found for "' + faceCode + '"');
    }

    return file;
  }

}
