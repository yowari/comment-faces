const Command = require('../command');

class Help extends Command {

  constructor () {
    super({
      name: 'help',
      description: 'display help command',
    });
  }

  execute (msg, args) {
    msg.channel.sendEmbed({
      color: 0xF9690E,
      title: 'Description',
      description: 'A discord bot to retrieve and generate comment faces based on *r/animes*',
      fields: [
        {
          name: 'Comment faces r/animes wiki page',
          value: '[https://www.reddit.com/r/anime/wiki/commentfaces](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
        },
        {
          name: 'Ping page to keep bot alive',
          value: 'http://commentfaces-onichan.rhcloud.com/',
        },
        {
          name: 'How to (copied from r/animes wiki page)',
          value: [
'- Comment faces can be used in text posts and comments',
'- The basic format to use is `[](#face-code)` (the face code is listed next to each face below)',
'- You can also add hover text: `[](#face-code "Hover text")`',
'- The faces also support adding text to the image: `[Text on top](...)` or `[**Text on bottom**](...)` (or both!)',
'- Animated faces are animated when you hover over them with your cursor',
          ].join('\n'),
        }
      ],
      footer: {
        text: '© 2017 | made with ♥️ by yowari'
      }
    });
  }

}

module.exports = Help;
