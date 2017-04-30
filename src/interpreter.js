const path = require('path');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const Jimp = require('jimp');

class Interpreter {

  read (message) {
    let parseResult = /\[(.*)\]\(#([a-zA-Z_-]+)(?:\s"(.*)")?\)/.exec(message.content);

    if (parseResult != null) {
      let [, textOnTop, faceCode, hoverText] = parseResult;

      let phantomjsArgs = [
        path.join(__dirname, 'image-extractor.js'),
        faceCode,
      ];

      let imageExtractor = childProcess.execFile(phantomjs.path, phantomjsArgs, function(error, stdout, stderr) {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        if (stdout)
          console.log(`stdout: ${stdout}`);

        if (stderr)
          console.error(`stderr: ${stderr}`);
      });

      imageExtractor.on('exit', function() {
        let imgData = require(`../faces-formats/${faceCode}.json`);

        Jimp.read(imgData.filePath)
          .then(function (image) {
            image.crop(
              imgData.x,
              imgData.y,
              imgData.width,
              imgData.height
            ).write(`faces/${faceCode}.png`, function (err) {
                if (err) {
                  console.error(err);
                  return;
                }

                message.channel.sendFile(`faces/${faceCode}.png`, `${faceCode}.png`);
              });
            }).catch(function (err) {
              console.error(err);
            });
      });
    }
  }

}

module.exports = Interpreter;
