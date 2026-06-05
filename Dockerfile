FROM node:24-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

FROM base AS development

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM base AS production

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs \
  && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]
