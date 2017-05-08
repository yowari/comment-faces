const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const phantomjs = require('phantomjs-prebuilt');
const Jimp = require('jimp');

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
      const faceCheck = /\[(.*)\]\(#([a-zA-Z0-9_-]+)(?:\s"(.*)")?\)/;

      if (faceCheck.test(msg.content)) {
        let [, textOnTop, faceCode, hoverText] = faceCheck.exec(msg.content);

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

                    msg.channel.sendFile(`${config.faceFolder}/${faceCode}.png`, `${faceCode}.png`);
                  });
                }).catch(console.error);
          } catch (e) {
            console.error(e);
          }
        });
      }
    }
  }

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
