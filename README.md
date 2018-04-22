# comment-faces

[![Docker Automated build][s1]][dc] [![Get the bot][s2]][bo] [![license][s3]][li]

[s1]: https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg
[s2]: https://img.shields.io/badge/Discord-Add%20to%20your%20server-blue.svg
[s3]: https://img.shields.io/badge/license-MIT-green.svg

[dc]: https://hub.docker.com/r/yowari/comment-faces/
[bo]: https://discordapp.com/oauth2/authorize?client_id=307244970451009538&scope=bot
[li]: LICENSE

**comment-faces** is a Discord bot whose primary function is to
generate comment faces based on [r/Animes][ra].

[ra]: https://www.reddit.com/r/anime

### To add the bot to your server, use [this link][bo]

## Usage

The format used to describe a comment face is `[Text on top](#face-code)`
which follows the r/Animes format.

example:

```
[](#WRYYY)
```

You can type text behind the comment face, the bot will detect the pattern.

For more information, you can print the help message using the bellow command in
Discord:

```
!cf help
```

## Installation

### Prerequisites

- [NodeJS][no] >= 8
- [GraphicsMagick][gm] >= 1.3.28

[no]: https://nodejs.org
[gm]: http://www.graphicsmagick.org/

### Installing

You can run comment-faces either locally with NodeJS or using a container with
Docker.

Before starting the bot, you have to create a discord bot. To do so, go to [https://discordapp.com/developers/applications/me]
and create a `New App`, then don't forget to `Create a Bot User`. Once done,
you have to set an environement variable holding the token named `TOKEN`.

#### Local

First, download the r/Animes wiki page in a folder named `ranimes`. Make sure
`wget` and `sed` are installed.

```
$ wget -E -H -p -k -e robots=off -P ranimes https://www.reddit.com/r/anime/wiki/commentfaces
$ sed -i'.bak' 's/href="commentfaces.html#/href="#/g' ranimes/www.reddit.com/r/anime/wiki/commentfaces.html
```

Then, you can use yarn or npm (even if yarn is better because it uses more
colors and has emoji :sparkles:) to install dependencies and run the bot:

```
$ yarn install
$ yarn run compile
$ ENV TOKEN=YOUR_DISCORD_TOKEN yarn start
```

#### Using Docker

The `Dockerfile` is configured with the `centos` image so that the image can be
deployed on `OpenShift`.

Note: No need to build the image, you can directly pull it.

```
$ docker pull yowari/comment-faces
$ docker run -d -e TOKEN=YOUR_DISCORD_TOKEN yowari/comment-faces
```
