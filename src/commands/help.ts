import { Message } from 'discord.js';
import { Command } from './command';

export class Help implements Command {

  execute (msg: Message, _args: string[]): void {
    msg.channel.send('', {
      embed: {
        color: 0xF9690E,
        title: 'Description',
        description: 'A discord bot to retrieve and generate comment faces based on *r/animes*',
        fields: [
          {
            name: 'Comment faces r/animes wiki page',
            value: '[https://www.reddit.com/r/anime/wiki/commentfaces](https://www.youtube.com/watch?v=HY03ilJnBZc)',
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
          text: '2018 | made with ♥️ by yowari'
        }
      }
    });
  }

}