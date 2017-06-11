FROM node:latest
MAINTAINER yowari

RUN apt-get update -y \
  && apt-get install -y imagemagick graphicsmagick

COPY . /usr/src/comment-faces
WORKDIR /usr/src/comment-faces

RUN npm install \
  && npm run compile

ENTRYPOINT ["npm", "start"]
