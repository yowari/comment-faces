const Discord = require('discord.js');

const config = require('./config.json');
const Interpreter = require('./src/interpreter.js');

const bot = new Discord.Client();

const interpreter = new Interpreter();
interpreter.loadCommands();

bot.on('ready', () => {
  bot.user.setGame(`${config.prefix}help to display informations`);
  console.log('comment-faces bot ready');
});

bot.on('message', message => {
  interpreter.read(message);
});

bot.login(config.token);
