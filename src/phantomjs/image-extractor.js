var system = require('system');
var webPage = require('webpage');
var fs = require('fs');

var config = require('../../config');

var page = webPage.create();

/*
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('MESSAGE: ' + msg);
}

page.onError = function(msg, trace) {
  console.error('ERROR: ' + msg);
}
*/

if (system.args.length <= 1) {
  console.log('Try to pass some arguments!');
  console.log('face-code not found');
  console.log('Usage:');
  console.log(' phantomjs image-extractor <face-code>');
  phantom.exit();
}

var faceCode = system.args[1];

function retrieveImageData(code) {

  function parseCSSAnimationKeyframe(content, code) {
    var animationRegex = new RegExp('\\.md \\[href(?:\\^)?="#' + code + '"\\]:hover{animation:([a-zA-Z0-9.()\\s-]*)[^}]*}');
    var keyframeRegex = new RegExp('@keyframes ' + code + '\\s*{\\s*from\\s*{\\s*background-position:([a-zA-Z0-9.()\\s-]*)}to{background-position:([a-zA-Z0-9.()\\s-]*)}');

    var matchedAnimation = animationRegex.exec(content);
    var matchedKeyframe = keyframeRegex.exec(content);

    if (matchedAnimation == null || matchedKeyframe == null) {
      return null;
    }

    return {
      from: {
        x: parseFloat(/([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[1])[1]) * -1,
        y: parseFloat(/([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[1])[2]) * -1,
      },
      to: {
        x: parseFloat(/([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[2])[1]) * -1,
        y: parseFloat(/([0-9.-]*)(?:px)?\s([0-9.-]*)(?:px)?/.exec(matchedKeyframe[2])[2]) * -1,
      },
      duration: parseFloat(/([\w]*) ([\d.-]*)(?:s)? steps\((\d*)\).*/.exec(matchedAnimation[1])[2]),
      steps: parseFloat(/([\w]*) ([\d.-]*)(?:s)? steps\((\d*)\).*/.exec(matchedAnimation[1])[3]),
    };
  }

  function retrieveAnimationData(code) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var stylesheet = document.styleSheets[i];
      var xhr = new XMLHttpRequest();

      xhr.open('GET', stylesheet.href, false);

      try {
        xhr.send(null);

        var animationData = parseCSSAnimationKeyframe(xhr.responseText, code);

        if (animationData != null) {
          return animationData;
        }
      } catch (e) {
        console.error(e + '\n' + stylesheet.href);
      }
    }

    return null;
  }

  var elt = document.querySelector('.md [href="#' + code + '"]');
  var eltStyle = window.getComputedStyle(elt);

  var imgData = {
    //filePath: /url\(file:\/\/(.*)\)/.exec(eltStyle.getPropertyValue('background-image'))[1],
    filePath: /url\((.*)\)/.exec(eltStyle.getPropertyValue('background-image'))[1],
    x: parseFloat(/(.*)px/.exec(eltStyle.getPropertyValue('background-position-x'))[1]) * -1,
    y: parseFloat(/(.*)px/.exec(eltStyle.getPropertyValue('background-position-y'))[1]) * -1,
    width: parseFloat(/(.*)px/.exec(eltStyle.getPropertyValue('width'))[1]),
    height: parseFloat(/(.*)px/.exec(eltStyle.getPropertyValue('height'))[1]),
  };

  var animationData = retrieveAnimationData(code);
  if (animationData != null) {
    imgData.animation = animationData;
  }

  return imgData;
}

page.open('https://www.reddit.com/r/anime/wiki/commentfaces', function(status) {
  if (status !== 'success') {
    console.error('Unable to load the address!');
    phantom.exit();
  }

  try {
    var imgData = page.evaluate(retrieveImageData, faceCode);
    fs.write(config.faceDataFolder + '/' + faceCode + '.json', JSON.stringify(imgData), 'w');
  } catch (e) {
    console.error(e);
  } finally {
    phantom.exit();
  }
});
