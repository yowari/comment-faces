import fs from 'fs';
import path from 'path';
import { ImageBuilder } from '@comment-faces/builder';

import { RedditPageParser } from '../lib/reddit-page-parser';

export interface Options {
  url: string;
  faceFolder: string;
}

export async function extractImages(options: Options) {
  // Since images in the reddit wiki page are next to each other on different
  // files, we need to rebuild the images by copying and croping the source
  // image. To do so we first need to extract metadata telling where is the
  // image, what size does it have and if the image is animated or not.
  const parser = new RedditPageParser(options.url);
  const faces = await parser.getCommentFacesImages();

  // build images from the extracted metadata
  const imageBuilder = new ImageBuilder();

  return Promise.all(
    faces.map((face) => {
      const image = imageBuilder.buildImage(
        face.src,
        face.position.x,
        face.position.y,
        face.size.width,
        face.size.height
      );

      const imageFilePath = path.resolve(options.faceFolder, face.faceCode + '.png');

      // save images and the extracted meta data
      return imageBuilder.saveImage(image, imageFilePath)
        .then(() => fs.writeFileSync(
          path.resolve(options.faceFolder, face.faceCode + '.json'),
          JSON.stringify(face, null, 2)))
        .catch(() => console.error(`cannot save "${face.faceCode}"`));
    })
  );
}
