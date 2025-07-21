ARG NODE_IMAGE=node:20.11.1-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS build
COPY --chown=node:node .env .env
RUN node ace build --ignore-ts-errors

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

COPY --chown=node:node ./package*.json ./
COPY --chown=node:node --from=build /home/node/app/build ./build
RUN npm ci --omit=dev

EXPOSE 3333

CMD [ "dumb-init", "node", "build/server.js" ]
