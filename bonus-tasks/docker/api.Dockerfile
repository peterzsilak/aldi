FROM node:26-bookworm-slim

WORKDIR /work

ENV CI=true

COPY package.json package-lock.json ./
RUN npm ci

COPY playwright.config.ts tsconfig.json biome.json eslint.config.mjs ./
COPY tests tests
COPY api api
COPY fixture fixture
COPY mock mock
COPY types types

CMD ["npx", "playwright", "test"]
