import * as fs from 'fs';
import * as path from 'path';
import * as phantom from 'phantom';
// TypeScript Definition error when using Gm() and gm.in() in lines 125 and 128
import * as Gm from 'gm';
//const Gm = require('gm');

class ImageExtractor {

  imgSaver: ImageSaver;
  metaExtractor : ImageMetaExtractor;

  constructor(public faceFolder: string) {
    this.imgSaver = new ImageSaver();
    this.metaExtractor = new ImageMetaExtractor();
  }

  getImage(faceCode: string, textOnTop: string): Promise<string> {
    return this.metaExtractor.extract(faceCode)
      .then(imgMeta => {
        if (imgMeta) {
          return this.imgSaver.save(imgMeta, this.faceFolder, faceCode);
        }
        else {
          return Promise.reject(`No image found for \`${faceCode}\``);
        }
      })
      .then(file => {
        if (textOnTop == '') {
          return file;
        }
        else {
          return this.imgSaver.addText(file, textOnTop);
        }
      });
  }

}

class ImageSaver {

  addText(file: string, text: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Gm(file)
        .font('/Library/Fonts/Arial Bold.ttf')
        .fontSize(20)
        .fill('#FFFFFF')
        .stroke('#000000', 1)
        .drawText(0, 20, text, 'north')
        .write(file, function (err: any) {
          if (err) {
            reject(err);
          }
          
          resolve(file);
        });
    });
  }

  save(imgMeta: ImageMeta, filedir: string, filename: string): Promise<string> {
    if (!fs.existsSync(filedir)) {
      fs.mkdirSync(filedir);
    }

    let file = path.join(filedir, `${filename}`);
    let image;

    return new Promise<string>((resolve, reject) => {
      if (typeof imgMeta.animation === 'undefined') {
        file += '.png';

        image = this.extractImage(imgMeta)
          .write(file, function (err) {
          if (err) {
            reject(err);
          }

          resolve(file);
        });
      }
      else {
        image = this.extractAnimatedImage(imgMeta, file)
          .then(image => {
            file += '.gif';

            image.write(file, function (err) {
              if (err) {
                reject(err);
              }

              resolve(file);
            });
          });
      }
      
    });
  }

  extractImage(imgMeta: ImageMeta): Gm.State {
    return Gm(imgMeta.filePath)
        .crop(imgMeta.width, imgMeta.height, imgMeta.x, imgMeta.y);
  }

  extractAnimatedImage(imgMeta: ImageMeta, file: string): Promise<Gm.State> {
    if (typeof imgMeta.animation == 'undefined') {
      throw new Error('Animation data not found');
    }

    const widthStep = (imgMeta.animation.to.x - imgMeta.animation.from.x) / imgMeta.animation.steps;
    const heightStep = (imgMeta.animation.to.y - imgMeta.animation.from.y) / imgMeta.animation.steps;

    let imgPromises = [];

    for (let i = 0; i <= imgMeta.animation.steps; i++) {
      imgPromises.push(new Promise<string>((resolve, reject) => {
        Gm(imgMeta.filePath)
          .crop(
            imgMeta.width,
            imgMeta.height,
            imgMeta.animation.from.x + (widthStep * i),
            imgMeta.animation.from.y + (heightStep * i)
          )
          .write(`${file}-${i+1}.png`, err => {
            if (err) {
              reject(err);
            }

            resolve(`${file}-${i+1}.png`);
          });
      }));
    }

    return Promise.all(imgPromises)
      .then(frames => {
        let gm = Gm(imgMeta.width, imgMeta.height);
        gm.repage("+");

        for (let frame of frames) {
          gm = gm.in(frame);
        }

        gm = gm.delay(imgMeta.animation.duration / (imgMeta.animation.steps + 1));
        gm = gm.resize(imgMeta.width, imgMeta.height);

        return gm;
      });
  }

}

class ImageMetaExtractor {

  extract(faceCode: string): Promise<ImageMeta> {
    let ph: phantom.PhantomJS;
    let redditPage: phantom.WebPage;
    
    return phantom.create(['--web-security=no'])
      .then(instance => {
        ph = instance;
        return instance.createPage();
      })
      .then(page => {
        redditPage = page;
        // page.on('onConsoleMessage', function(msg) {
        //   console.log('CONSOLE: ' + msg);
        // });
        return page.open('./ranimes/commentfaces - anime.html');
      })
      .then(status => {
        if (status !== 'success') {
          return Promise.reject(`Failed to load reddit page. \`status: ${status}\``);
        }

        return redditPage.evaluate<string, ImageMeta>(function(code: string) {
          var elt = document.querySelector('.md [href="#' + code + '"]');

          if (elt == null) {
            throw new Error('Element no found for code: ' + code);
          }

          var eltStyle = window.getComputedStyle(elt);

          var imgMeta: any = {};

          var backgroundImage = eltStyle.getPropertyValue('background-image');
          var backgroundPositionX = eltStyle.getPropertyValue('background-position-x');
          var backgroundPositionY = eltStyle.getPropertyValue('background-position-y');
          var width = eltStyle.getPropertyValue('width');
          var height = eltStyle.getPropertyValue('height');


          if (backgroundImage != null && backgroundPositionX != null && backgroundPositionY != null && width != null && height != null) {
            var extrBackgroundImage = /url\(file:\/\/(.*)\)/.exec(backgroundImage);
            //var extrBackgroundImage = /url\((.*)\)/.exec(backgroundImage);
            var extrBackgroundPositionX = /(.*)px/.exec(backgroundPositionX);
            var extrBackgroundPositionY = /(.*)px/.exec(backgroundPositionY);
            var extrWidth = /(.*)px/.exec(width);
            var extrHeight = /(.*)px/.exec(height);

            if (extrBackgroundImage != null && extrBackgroundImage.length == 2
                && extrBackgroundPositionX != null && extrBackgroundPositionX.length == 2
                && extrBackgroundPositionY != null && extrBackgroundPositionY.length == 2
                && extrWidth != null && extrWidth.length == 2
                && extrHeight != null && extrHeight.length == 2) {
              imgMeta['filePath'] = extrBackgroundImage[1];
              imgMeta['x'] = parseFloat(extrBackgroundPositionX[1]) * -1;
              imgMeta['y'] = parseFloat(extrBackgroundPositionY[1]) * -1;
              imgMeta['width'] = parseFloat(extrWidth[1]);
              imgMeta['height'] = parseFloat(extrHeight[1]);
             
              for (var i = 0; i < document.styleSheets.length; i++) {
                var stylesheet = document.styleSheets[i];
                var xhr = new XMLHttpRequest();

                xhr.open('GET', stylesheet.href, false);

                try {
                  xhr.send(null);

                  var animationRegex = new RegExp('\\.md \\[href(?:\\^)?="#' + code + '"\\]:hover{animation:([a-zA-Z0-9.()\\s-]*)[^}]*}');
                  var keyframeRegex = new RegExp('@keyframes ' + code + '\\s*{\\s*from\\s*{\\s*background-position:([a-zA-Z0-9.()\\s-]*)}to{background-position:([a-zA-Z0-9.()\\s-]*)}');

                  var matchedAnimation = animationRegex.exec(xhr.responseText);
                  var matchedKeyframe = keyframeRegex.exec(xhr.responseText);

                  if (matchedAnimation != null && matchedAnimation.length == 2
                      && matchedKeyframe != null && matchedKeyframe.length == 3) {
                    var extrFrom = /([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[1]);
                    var extrTo = /([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[2]);
                    var extrMeta = /([\w]*) ([\d.-]*)(?:s)? steps\((\d*)\).*/.exec(matchedAnimation[1]);

                    if (extrFrom != null && extrFrom.length == 3
                        && extrTo != null && extrTo.length == 3
                        && extrMeta != null && extrMeta.length == 4) {
                      imgMeta['animation'] = {
                        from: {
                          x: parseFloat(extrFrom[1]) * -1,
                          y: parseFloat(extrFrom[2]) * -1,
                        },
                        to: {
                          x: parseFloat(extrTo[1]) * -1,
                          y: parseFloat(extrTo[2]) * -1,
                        },
                        duration: parseFloat(extrMeta[2]),
                        steps: parseFloat(extrMeta[3]),
                      };

                      break;
                    }

                  }

                } catch (e) {
                  //console.error(e + '\n' + stylesheet.href);
                }
              }
            }
            else {
              throw new Error('Parse data error when retrieving ' + code);
            }
          }
          else {
            throw new Error('Cannot retrieve data ' + code);
          }

          return imgMeta;
        }, faceCode);
      })
      .then(imgMeta => {
        redditPage.close()
          .then(() => ph.exit());
        return imgMeta;
      });
  }

}

interface ImageMeta {
  filePath: string;
  x: number;
  y: number;
  width: number;
  height: number;
  animation?: AnimationMeta;
}

interface AnimationMeta {
  from: PositionMeta;
  to: PositionMeta;
  duration: number;
  steps: number;
}

interface PositionMeta {
  x: number;
  y: number;
}

export { ImageExtractor };