var system = require('system');
var webPage = require('webpage');

var args = system.args;

var page = webPage.create();

if (args.length <= 1) {
  console.log('Try to pass some arguments!');
  console.log('face-code not found');
  console.log('Usage:');
  console.log(' phantomjs image-extractor <face-code>');
  phantom.exit();
}

var faceCode = args[1];

page.open('https://www.reddit.com/r/anime/wiki/commentfaces', function(status) {
  if (status !== 'success') {
    console.log('Unable to load the address!');
    phantom.exit();
  }

  var img = page.evaluate(function (code) {
    var selector = '.md [href="#' + code + '"]';
    return document.querySelector(selector).getBoundingClientRect();
  }, faceCode);

  if (img != null) {
    page.clipRect = {
        top: img.top - 22825,
        left: img.left,
        width: img.width,
        height: img.height
    };

    page.render('faces/' + faceCode + '.png');
  }

  phantom.exit();
});
