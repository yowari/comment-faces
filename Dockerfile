FROM node:latest
MAINTAINER yowari

RUN apt-get update -y \
  && apt-get install -y imagemagick \
  && apt-get install -y graphicsmagick

COPY . /usr/src/comment-faces
WORKDIR /usr/src/comment-faces

RUN npm install

ENTRYPOINT ["npm", "start"]
