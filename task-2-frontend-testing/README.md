# Task-2: frontend testing

## Stack

This implementation uses:

- **Node.js 26** with **nvm** via the local `.nvmrc`
- **TypeScript 7**
- **Playwright 1.62.1**
- **Biome** for formatting and general linting
- **ESLint** with `eslint-plugin-playwright` for Playwright-specific rules
- **Husky** + **lint-staged** for pre-commit checks

## Setup

From the `task-2-frontend-testing` folder:

```bash
nvm install
nvm use
npm install
npx playwright install --with-deps
```

## Common commands

```bash
npm run check
npm test
npm run test:ui
```
