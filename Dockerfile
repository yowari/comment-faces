FROM node:latest
MAINTAINER yowari

COPY . /usr/src/comment-faces
WORKDIR /usr/src/comment-faces

RUN npm install

ENTRYPOINT ["npm", "start"]
