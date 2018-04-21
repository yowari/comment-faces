import * as phantom from 'phantom';

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

class ImageMetaExtractor {

  constructor(private redditPageUrl: string) {
  }

  async extract(faceCode: string): Promise<ImageMeta> {
    let phantomInstance = await phantom.create(['--web-security=no']);
    let redditPage = await phantomInstance.createPage();
    // page.on('onConsoleMessage', function(msg) {
    //   console.log('CONSOLE: ' + msg);
    // });
    let status = await redditPage.open(this.redditPageUrl);
    if (status !== 'success') {
      return Promise.reject(`Failed to load reddit page. \`status: ${status}\``);
    }

    let imgMeta = await redditPage.evaluate<string, ImageMeta>(parseRedditPage, faceCode);
    redditPage.close()
          .then(() => phantomInstance.exit());
        return imgMeta;
  }

}

function parseRedditPage(faceId: string) {
  var elt = document.querySelector('.md [href="#' + faceId + '"]');

  if (elt == null) {
    throw new Error('Element no found for faceId: ' + faceId);
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

        if (stylesheet.href === null) {
          throw new Error('Cannot retrieve image URL');
        }

        xhr.open('GET', stylesheet.href, false);

        try {
          xhr.send(null);

          var animationRegex = new RegExp('\\.md \\[href(?:\\^)?="#' + faceId + '"\\]:hover{animation:([a-zA-Z0-9.()\\s-]*)[^}]*}');
          var keyframeRegex = new RegExp('@keyframes ' + faceId + '\\s*{\\s*from\\s*{\\s*background-position:([a-zA-Z0-9.()\\s-]*)}to{background-position:([a-zA-Z0-9.()\\s-]*)}');

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
      throw new Error('Parse data error when retrieving ' + faceId);
    }
  }
  else {
    throw new Error('Cannot retrieve data ' + faceId);
  }

  return imgMeta;
}

export { ImageMeta, AnimationMeta, ImageMetaExtractor };