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
COPY --chown=node:node ./config/serviceAccountKey.json ./config/serviceAccountKey.json
USER node
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .
COPY --chown=node:node ./config/serviceAccountKey.json ./config/serviceAccountKey.json


FROM dependencies AS build
RUN node ace build --ignore-ts-errors

FROM base AS production
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

RUN mkdir -p /home/node/app/build/uploads/users \
             /home/node/app/build/uploads/places \
             /home/node/app/build/uploads/plans \
             /home/node/app/build/uploads/posts \
  && chown -R node:node /home/node/app/build/uploads
COPY --chown=node:node --from=dependencies /home/node/app/node_modules ./node_modules
COPY --chown=node:node ./package*.json ./
COPY --chown=node:node --from=build /home/node/app/build ./build
RUN npm ci --omit=dev

EXPOSE 3333

CMD [ "dumb-init", "node", "build/server.js" ]
