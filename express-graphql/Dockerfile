### Never send your "passwords" in Production ###
FROM node:lts-slim AS base-build

RUN \
    apt update && apt upgrade -y \
    && apt install clevis -y \
    && rm -rf /var/lib/apt/lists/*


# === DEV ===
FROM base-build AS dev
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
WORKDIR /home/node/express-graphql

# === PROD ===
FROM base-build AS prod
ENV NODE_ENV=production
RUN \
    mkdir -p /home/node/express-graphql/node_modules \
    && chown -R node:node /home/node/express-graphql
WORKDIR /home/node/express-graphql
COPY package*.json ./
RUN npm install
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "node", "server.js" ]