# QA Engineer Homework Assignment

This repository contains the completed technical assignment for the Quality Assurance Engineer position. The task assignment specification is stored in [`home-assignment.md`](./home-assignment.md).

---

## Project Structure

```text
.
├── home-assignment.md             # Original task description and requirements
├── README.md                      # General overview & setup instructions
├── task-1-manual-testing/
│   ├── test-cases.md              # Manual test cases for the ALDI storefront cart flow
│   └── bug-report.md              # Sample bug report for a UI/cart counter issue
├── task-2-frontend-testing/
│   ├── .github/workflows/
│   │   └── playwright.yml         # GitHub Actions workflow for Playwright execution
│   ├── .husky/
│   │   └── pre-commit             # Husky pre-commit quality checks
│   ├── fixture/                   # Shared Playwright test fixtures and user data
│   ├── page-objects/              # Reusable page objects for UI testing
│   ├── tests/                     # End-to-end Playwright specs
│   │   └── login.spec.ts          # Login flow coverage (success + failure cases)
│   ├── types/                     # Shared TypeScript types
│   ├── .nvmrc                     # Project-local Node.js version
│   ├── .gitignore                 # Ignore rules for the frontend task
│   ├── README.md                  # Frontend testing stack and setup guide
│   ├── biome.json                 # Biome formatter and linter config
│   ├── eslint.config.mjs          # ESLint config for Playwright-specific rules
│   ├── package.json               # Dependencies and scripts
│   ├── playwright.config.ts       # Playwright runner configuration
│   └── tsconfig.json              # TypeScript compiler configuration
├── task-3-api-testing/
│   ├── api/                       # Generic API client and the task service client built on it
│   ├── fixture/                   # Worker-scoped mock lifecycle, API client and assertion helpers
│   ├── mock/                      # In-process mock of the task management REST API
│   ├── tests/                     # API specs, one per endpoint
│   │   ├── create-task.spec.ts    # POST /tasks
│   │   ├── get-task.spec.ts       # GET /tasks/{id}
│   │   ├── update-task.spec.ts    # PUT /tasks/{id}
│   │   └── delete-task.spec.ts    # DELETE /tasks/{id}
│   ├── types/                     # Shared TypeScript types
│   ├── .nvmrc                     # Project-local Node.js version
│   ├── .gitignore                 # Ignore rules for the API task
│   ├── README.md                  # API testing stack, mocked endpoints and setup guide
│   ├── biome.json                 # Biome formatter and linter config
│   ├── eslint.config.mjs          # ESLint config for TypeScript and Playwright rules
│   ├── package.json               # Dependencies and scripts
│   ├── playwright.config.ts       # Playwright runner configuration
│   └── tsconfig.json              # TypeScript compiler configuration
├── bonus-tasks/                   # (currently empty placeholder; bonus items not implemented yet)
└── node_modules/                  # Installed project dependencies for task-2
```
