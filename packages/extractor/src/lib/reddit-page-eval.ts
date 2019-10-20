import { FaceImage } from './reddit-image';

export function redditPageEval(): FaceImage[] {

  function getFaceCode(elt: HTMLAnchorElement): string {
    const extrFaceCode = /#(.*)/.exec(elt.href);

    if (!extrFaceCode || extrFaceCode.length < 2) {
      throw new Error('Cannot get face code');
    }

    return extrFaceCode[1];
  }

  function getFaceImage(faceCode: string): FaceImage {
    const elt = document.querySelector('.md [href="#' + faceCode + '"]');

    if (!elt) {
      throw new Error('Element no found for faceId: ' + faceCode);
    }

    const eltStyle = window.getComputedStyle(elt);

    const backgroundImage = eltStyle.getPropertyValue('background-image');
    const backgroundPositionX = eltStyle.getPropertyValue('background-position-x');
    const backgroundPositionY = eltStyle.getPropertyValue('background-position-y');
    const width = eltStyle.getPropertyValue('width');
    const height = eltStyle.getPropertyValue('height');

    if (!backgroundImage || !backgroundPositionX || !backgroundPositionY || !width || !height) {
      throw new Error('Cannot retrieve data ' + faceCode);
    }

    const extrBackgroundImage = /url\("file:\/\/(.*)"\)/.exec(backgroundImage);
    // const extrBackgroundImage = /url\((.*)\)/.exec(backgroundImage);
    // const extrBackgroundPositionX = /(.*)(?:px|%)/.exec(backgroundPositionX);
    // const extrBackgroundPositionY = /(.*)(?:px|%)/.exec(backgroundPositionY);
    const extrWidth = /(.*)(?:px)/.exec(width);
    const extrHeight = /(.*)(?:px)/.exec(height);

    if (!extrBackgroundImage || extrBackgroundImage.length < 2
      // || !extrBackgroundPositionX || extrBackgroundPositionX.length < 2
      // || !extrBackgroundPositionY || extrBackgroundPositionY.length < 2
      || !extrWidth || extrWidth.length < 2
      || !extrHeight || extrHeight.length < 2) {
      throw new Error('Parse data error when retrieving "' + faceCode + '"');
    }

    const backgroundImageSize = getImageSize('file://' + extrBackgroundImage[1]);

    const face: FaceImage = {
      faceCode,
      src: extrBackgroundImage[1],
      position: {
        x: getPositionInPx(backgroundPositionX, parseFloat(extrWidth[1]), backgroundImageSize.width),
        y: getPositionInPx(backgroundPositionY, parseFloat(extrHeight[1]), backgroundImageSize.height)
      },
      size: {
        width: parseFloat(extrWidth[1]),
        height: parseFloat(extrHeight[1])
      }
    };

    return face;
  }

  function getPositionInPx(backgroundPosition: string, croppedSize: number, imageSize: number): number {
    if (backgroundPosition.endsWith('%')) {
      return (parseFloat(backgroundPosition) * (imageSize - croppedSize)) / 100;
    } else if (backgroundPosition.endsWith('px')) {
      return (imageSize - parseFloat(backgroundPosition)) % imageSize;
    } else {
      throw new Error('Position format not supprted');
    }
  }

  function getImageSize(imageSrc: string): { width: number, height: number } {
    const image = new Image();
    image.src = imageSrc;

    return {
      width: image.width,
      height: image.height
    };
  }

  const elts = document.querySelectorAll<HTMLAnchorElement>('.md table [href^="#"]');

  return Array.from(elts)
    .map((elt) => getFaceCode(elt))
    .map((faceCode) => getFaceImage(faceCode));
}

// export function parseRedditPage(faceId: string) {
//       for (var i = 0; i < document.styleSheets.length; i++) {
//         var stylesheet = document.styleSheets[i];
//         var xhr = new XMLHttpRequest();

//         if (stylesheet.href === null) {
//           throw new Error('Cannot retrieve image URL');
//         }

//         xhr.open('GET', stylesheet.href, false);

//         try {
//           xhr.send(null);

//           var animationRegex = new RegExp('\\.md \\[href(?:\\^)?="#' + faceId + '"\\]:hover{animation:([a-zA-Z0-9.()\\s-]*)[^}]*}');
//           var keyframeRegex = new RegExp('@keyframes ' + faceId + '\\s*{\\s*from\\s*{\\s*background-position:([a-zA-Z0-9.()\\s-]*)}to{background-position:([a-zA-Z0-9.()\\s-]*)}');

//           var matchedAnimation = animationRegex.exec(xhr.responseText);
//           var matchedKeyframe = keyframeRegex.exec(xhr.responseText);

//           if (matchedAnimation != null && matchedAnimation.length == 2
//               && matchedKeyframe != null && matchedKeyframe.length == 3) {
//             var extrFrom = /([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[1]);
//             var extrTo = /([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[2]);
//             var extrMeta = /([\w]*) ([\d.-]*)(?:s)? steps\((\d*)\).*/.exec(matchedAnimation[1]);

//             if (extrFrom != null && extrFrom.length == 3
//                 && extrTo != null && extrTo.length == 3
//                 && extrMeta != null && extrMeta.length == 4) {
//               imgMeta['animation'] = {
//                 from: {
//                   x: parseFloat(extrFrom[1]) * -1,
//                   y: parseFloat(extrFrom[2]) * -1,
//                 },
//                 to: {
//                   x: parseFloat(extrTo[1]) * -1,
//                   y: parseFloat(extrTo[2]) * -1,
//                 },
//                 duration: parseFloat(extrMeta[2]),
//                 steps: parseFloat(extrMeta[3]),
//               };

//               break;
//             }

//           }

//         } catch (e) {
//           //console.error(e + '\n' + stylesheet.href);
//         }
//       }
// }
