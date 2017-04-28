const Discord = require('discord.js');
const Interpreter = require('./src/interpreter.js');

const client = new Discord.Client();

const config = {
  token: "MzA3MjQ0OTcwNDUxMDA5NTM4.C-PgcQ._cGEu1hEUR_Kl2Njdp1MgfTA6C0",
};

const interpreter = new Interpreter();

client.on('ready', () => {
  console.log('Comment faces ready');
});

client.on('message', message => {
  interpreter.read(message);
});

client.login(config.token);
