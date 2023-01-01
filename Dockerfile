FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json .
COPY src/ src/
RUN npm ci
RUN npm run build

FROM node:16-alpine
LABEL maintainer=yowari
ENV NODE_ENV production
WORKDIR /app
COPY package.json package-lock.json .
COPY --from=builder /app/dist/ ./dist/
RUN npm ci --only=production
ENTRYPOINT node ./dist/fetch-images.js;node ./dist/deploy-commands.js;node ./dist/client.js
