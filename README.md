# comment-faces

[![Get the bot][s1]][bo] [![license][s2]][li]

[s1]: https://img.shields.io/badge/Discord-Add%20to%20your%20server-blue.svg
[s2]: https://img.shields.io/badge/license-MIT-green.svg

[dc]: https://hub.docker.com/r/yowari/comment-faces/
[bo]: https://discord.com/api/oauth2/authorize?client_id=307244970451009538&permissions=2147485696&scope=bot%20applications.commands
[li]: LICENSE

**comment-faces** is a Discord bot whose primary function is to
generate comment faces based on [r/Animes][ra].

[ra]: https://www.reddit.com/r/anime

### To add the bot to your server, use [this link][bo]

## Usage

Type in discord the slash command `/comment-faces <face-id>`. `face-id` is the id
of the image to be used. Example:

```
/comment-faces WRYYY
```

## Installation

### Prerequisites

- [NodeJS][no] >= 16.9

[no]: https://nodejs.org

### Installing

You can run comment-faces either locally with NodeJS or using a container with
Docker.

Before starting the bot, you have to create a discord bot. To do so, go to [Discord developer page](https://discord.com/developers/applications)
and create one using `New Application` button. Once done,
you have to set an environement variables `TOKEN` and `CLIENT_ID` holding the bot token and clientId respectively.

#### Local

Before launching any command, you need to install the node dependencies:

```
npm install
```

First, You need to fetch images list from [r/animes comment faces repository](https://github.com/r-anime/comment-face-assets):

```
npm run fetch-images
```

Once done, you should have a file `images.json` in the root folder. After that, slash commands need to be deployed,
to do so run the command:

```
npm run deploy-commands
```

After successfully deployed the commands, you can start the bot:

```
npm start
```

#### Using Docker

The `Dockerfile` is configured with the `node:alpine` image.

Note: No need to build the image, you can directly pull it.

```
$ docker pull yowari/comment-faces
$ docker run -d -e TOKEN=YOUR_DISCORD_TOKEN -e CLIENT_ID=YOUR_DISCORD_CLIENT_ID yowari/comment-faces
```
