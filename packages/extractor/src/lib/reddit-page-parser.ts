import puppeteer from 'puppeteer';

import { FaceImage } from './reddit-image';
import { redditPageEval } from './reddit-page-eval';

export class RedditPageParser {

  constructor(private readonly url: string) {
  }

  async getCommentFacesImages(): Promise<FaceImage[]> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(this.url);

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

    const commentFacesImages = await page.evaluate(redditPageEval);

    await browser.close();

    return commentFacesImages;
  }

}
