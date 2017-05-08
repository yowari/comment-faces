var system = require('system');
var webPage = require('webpage');
var fs = require('fs');

var config = require('../../config');

var page = webPage.create();

if (system.args.length <= 1) {
  console.log('Try to pass some arguments!');
  console.log('face-code not found');
  console.log('Usage:');
  console.log(' phantomjs image-extractor <face-code>');
  phantom.exit();
}

var faceCode = system.args[1];

function retrieveImageData(code) {
  var elt = document.querySelector('.md [href="#' + code + '"]');
  var eltStyle = window.getComputedStyle(elt);

  return {
    backgroundImage: eltStyle.getPropertyValue('background-image'),
    backgroundPositionX: eltStyle.getPropertyValue('background-position-x'),
    backgroundPositionY: eltStyle.getPropertyValue('background-position-y'),
    width: eltStyle.getPropertyValue('width'),
    height: eltStyle.getPropertyValue('height'),
  };
}

function parseImageData(imgData) {
  return {
    //filePath: /url\(file:\/\/(.*)\)/.exec(imgData.backgroundImage)[1],
    filePath: /url\((.*)\)/.exec(imgData.backgroundImage)[1],
    x: parseFloat(/(.*)px/.exec(imgData.backgroundPositionX)[1]) * -1,
    y: parseFloat(/(.*)px/.exec(imgData.backgroundPositionY)[1]) * -1,
    width: parseFloat(/(.*)px/.exec(imgData.width)[1]),
    height: parseFloat(/(.*)px/.exec(imgData.height)[1]),
  };
}

page.open('https://www.reddit.com/r/anime/wiki/commentfaces', function(status) {
  if (status !== 'success') {
    console.error('Unable to load the address!');
    phantom.exit();
  }

  try {
    var imgData = page.evaluate(retrieveImageData, faceCode);
    var img = parseImageData(imgData);

    fs.write(config.faceDataFolder + '/' + faceCode + '.json', JSON.stringify(img), 'w');
  } catch (e) {
    console.error(e);
  } finally {
    phantom.exit();
  }
});
