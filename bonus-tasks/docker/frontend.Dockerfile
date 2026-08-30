FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /work

ENV CI=true
ENV HUSKY=0

COPY package.json package-lock.json ./
RUN npm ci

COPY playwright.config.ts tsconfig.json biome.json eslint.config.mjs ./
COPY tests tests
COPY page-objects page-objects
COPY fixture fixture
COPY types types

CMD ["npx", "playwright", "test"]
