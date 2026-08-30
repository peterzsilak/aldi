# Task-3: API testing

Playwright API test suite for a RESTful task management service. The service itself is **mocked
in-process**, so the suite is fully deterministic and needs no external environment.

## Stack

- **Node.js 26** with **nvm** via the local `.nvmrc`
- **TypeScript 7** (`tsc`), with the TypeScript 6 API kept side-by-side for tooling
- **Playwright 1.62.1** (`APIRequestContext`, no browsers required)
- **Biome** for formatting and general linting
- **ESLint** with `typescript-eslint` and `eslint-plugin-playwright`

> TypeScript 7 no longer ships the legacy compiler API that `typescript-eslint` needs, so the
> project follows the official side-by-side setup: `typescript` is aliased to
> `@typescript/typescript6` for tooling, while `@typescript/native` provides the TS 7 `tsc`.

## Layout

```text
task-3-api-testing/
├── api/
│   ├── generic-api-client/  # Reusable client: request builder, retries, logging, typed errors
│   └── task-api-client/     # Task service client extending the generic one
├── fixture/
│   ├── api.ts               # Worker fixture starting the mock, client + helpers per test
│   └── expect-api-error.ts  # Assertion helper for typed client errors
├── mock/
│   ├── task-api-server.ts   # HTTP layer: routing, status codes, error bodies
│   └── task-store.ts        # In-memory store and payload validation
├── tests/
│   ├── create-task.spec.ts   # POST   /tasks
│   ├── get-task.spec.ts      # GET    /tasks/{id}
│   ├── update-task.spec.ts   # PUT    /tasks/{id}
│   └── delete-task.spec.ts   # DELETE /tasks/{id}
└── types/
    └── task.ts              # Shared Task/API types
```

The mock lives entirely outside the specs. Tests only ask for the `taskApiClient` fixture, which
starts the mock once per worker, resets its store before every test and hands over a client bound
to the mock's base URL.

## API client layer

`GenericApiClient` wraps Playwright's `APIRequestContext` and owns the cross-cutting concerns of an
HTTP call, so the specs stay free of transport details:

- **Request building** – base URL resolution, query parameters, default JSON headers, timeouts.
- **Logging** – every request, response and retry is logged. Silent by default; raise it with
  `API_LOG_LEVEL=debug npm test` (`error`, `warn`, `info`, `debug`).
- **Retries** – retryable statuses (`408`, `429`, `5xx`) are retried with exponential backoff.
- **Typed errors** – failed responses are mapped onto an error hierarchy (`ApiError` →
  `ClientError`/`ServerError` → `NotFoundError`, `BadRequestError`, ...) carrying the full
  request/response context.

`TaskApiClient` extends it with the domain methods and promotes `400`/`404` to `TaskValidationError`
and `TaskNotFoundError`:

```ts
const task = await taskApiClient.createTask({ title: "Buy milk" });
const error = await expectApiError(taskApiClient.getTask(unknownId), TaskNotFoundError);
```

Every method has a `*Result` counterpart (`createTaskResult`, `getTaskResult`, ...) that returns the
raw `ApiCallResult` without throwing, which keeps status-, header- and raw-body assertions explicit.

## Mocked endpoints

| Method   | Path          | Success            | Failure modes                                          |
| -------- | ------------- | ------------------ | ------------------------------------------------------ |
| `POST`   | `/tasks`      | `201` + task body, `Location: /tasks/{id}` | `400` invalid payload or body |
| `GET`    | `/tasks`      | `200` + task array | –                                                      |
| `GET`    | `/tasks/{id}` | `200` + task body  | `404` unknown id                                       |
| `PUT`    | `/tasks/{id}` | `200` + updated task | `400` invalid payload, `404` unknown id              |
| `DELETE` | `/tasks/{id}` | `204` empty body   | `404` unknown id                                       |

Any other path returns `404`, and unsupported methods return `405` with an `Allow` header.

### Task resource

```json
{
    "id": "4f0e0a2c-....",
    "title": "Buy milk",
    "description": "2 litres of whole milk",
    "status": "todo",
    "createdAt": "2026-09-03T10:00:00.000Z",
    "updatedAt": "2026-09-03T10:00:00.000Z"
}
```

`status` is one of `todo`, `in_progress`, `done` and defaults to `todo`. `PUT` has replace
semantics: omitted optional fields fall back to their defaults.

### Error resource

```json
{
    "error": "Bad Request",
    "details": ["title is required and must be a non-empty string"]
}
```

## Setup

From the `task-3-api-testing` folder:

```bash
nvm install
nvm use
npm install
```

## Common commands

```bash
npm run check   # typecheck + Biome + ESLint
npm test        # runs the checks, then the API suite
npm run test:ui
```
