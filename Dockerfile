ARG NODE_IMAGE=node:20.11.1-slim

FROM $NODE_IMAGE AS base

# Install dependencies for sharp
USER root
RUN apt-get update && apt-get install -y \
    dumb-init \
    libvips-dev \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build --ignore-ts-errors

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

RUN mkdir -p /home/node/app/build/uploads/users && chown -R node:node /home/node/app/build
COPY --chown=node:node ./package*.json ./
COPY --chown=node:node --from=build /home/node/app/build ./build
RUN npm ci --omit=dev

EXPOSE 3333

CMD [ "dumb-init", "node", "build/server.js" ]
