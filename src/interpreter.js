const path = require('path');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');

const pattern = /\[(.*)\]\(#([a-zA-Z_-]+)(?:\s"(.*)")?\)/;

class Interpreter {

  read (message) {
    let parseResult = pattern.exec(message.content);

    if (parseResult != null) {
      let [, textOnTop, faceCode, hoverText] = parseResult;

      let phantomjsArgs = [
        '--disk-cache=true',
        path.join(__dirname, 'image-extractor.js'),
        faceCode,
      ];

      let imageExtractor = childProcess.execFile(phantomjs.path, phantomjsArgs, function(error, stdout, stderr) {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
      });

      imageExtractor.on('exit', function() {
        message.channel.sendFile(`faces/${faceCode}.png`, `${faceCode}.png`);
      });
    }
  }

}

module.exports = Interpreter;
