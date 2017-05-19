const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const Jimp = require('jimp');
const Gm = require('gm');

const config = require('../config.json');

class Interpreter {

  constructor () {
    this.commands = {};
  }

  loadCommands () {
    const CommandClass = require('./commands/help');
    let cmd = new CommandClass();
    this.commands[cmd.name] = cmd;
  }

  read (msg) {
    if (msg.content.startsWith(config.prefix)) {
      const args = msg.content.slice(config.prefix.length).split(' ');
      const command = args.shift();

      if (command && command in this.commands) {
        this.commands[command].execute(msg, args);
      } else {
        msg.reply('Command not found :frowning2:');
      }
    } else {
      parse(msg);
    }
  }

}

function parse(msg) {
  const faceCodeExpr = /\[(.*)\]\(#([a-zA-Z0-9_-]+)(?:\s"(.*)")?\)/.exec(msg.content);

  if (faceCodeExpr == null) {
    return;
  }

  let [, textOnTop, faceCode, hoverText] = faceCodeExpr;

  let phantomjsArgs = [
    path.join(__dirname, 'phantomjs/image-extractor.js'),
    faceCode,
  ];

  let imageExtractor = childProcess.execFile(phantomjs.path, phantomjsArgs, printError);

  imageExtractor.on('exit', function() {
    try {
      let imgData = require(`../${config.faceDataFolder}/${faceCode}.json`);

      if (!fs.existsSync(config.faceFolder)) {
        fs.mkdirSync(config.faceFolder);
      }

      if (typeof imgData.animation === 'undefined') {
        sendStaticImage(msg.channel, imgData, faceCode);
      } else {
        sendAnimatedImage(msg.channel, imgData, faceCode);
      }
    } catch (e) {
      console.error(e);
    }
  });
}

function sendStaticImage(channel, imgData, faceCode) {
  Jimp.read(imgData.filePath)
    .then(function (image) {
      image.crop(
        imgData.x,
        imgData.y,
        imgData.width,
        imgData.height
      ).write(`${config.faceFolder}/${faceCode}.png`, function (err) {
        if (err) {
          console.error(err);
          return;
        }

        channel.send('', {
          files: [ `${config.faceFolder}/${faceCode}.png` ]
        });
      });
    }).catch(console.error);
}

function sendAnimatedImage(channel, imgData, faceCode) {
  Jimp.read(imgData.filePath)
    .then(function (image) {
      let widthStep = (imgData.animation.to.x - imgData.animation.from.x) / imgData.animation.steps;
      let heightStep = (imgData.animation.to.y - imgData.animation.from.y) / imgData.animation.steps;

      new Promise(function(resolve, reject) {
        var savedFiles = 0;

        for (let i = 0; i <= imgData.animation.steps; i++) {
          image.clone().crop(
            imgData.animation.from.x + (widthStep * i),
            imgData.animation.from.y + (heightStep * i),
            imgData.width,
            imgData.height
          ).write(`${config.faceFolder}/${faceCode}-${i+1}.png`, function (err) {
            if (err) {
              console.error(err);
              return;
            }

            savedFiles++;

            if (savedFiles > imgData.animation.steps) {
              resolve();
            }
          });
        }
      }).then(function() {
        let gm = Gm();
        for (let i = 0; i <= imgData.animation.steps; i++) {
          gm = gm.in(`${config.faceFolder}/${faceCode}-${i+1}.png`);
        }
        gm.delay(imgData.animation.duration / (imgData.animation.steps + 1))
          .resize(imgData.width, imgData.height)
          .write(`${config.faceFolder}/${faceCode}.gif`, function (err) {
            if (err)
              throw err;

            channel.send('', {
              files: [ `${config.faceFolder}/${faceCode}.gif` ]
            });
          });

      }).catch(console.error);
    }).catch(console.error);
}

function printError(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }

  if (stdout)
    console.log(`stdout: ${stdout}`);

  if (stderr)
    console.error(`stderr: ${stderr}`);
}

module.exports = Interpreter;
