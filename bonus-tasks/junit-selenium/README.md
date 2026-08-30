# Bonus: JUnit + Selenium — Delete Task

## Approach

The assignment asks how I would automate **Delete Task** in the web application with
**Selenium** and **JUnit**. I would not drive a live backend. I would do the same thing as
Task 3: **mock the REST endpoints**, then talk to that mock through a **typed API client**.

In Java that client is a **Spring Cloud OpenFeign** interface. The tests stay on `Task`,
`CreateTaskRequest` and typed errors (`FeignException.NotFound`) instead of raw JSON — the same
idea as `TaskApiClient` in [`task-3-api-testing`](../../task-3-api-testing/).

```text
JUnit 5 test
 ├── Feign TaskApiClient  →  in-memory mock API  (POST /tasks, GET /tasks/{id}, DELETE /tasks/{id})
 └── Selenium WebDriver   →  Thymeleaf UI        →  same TaskStore
```

| Piece | Role |
| --- | --- |
| **JUnit 5** | Runner, lifecycle, assertions |
| **In-memory `TaskStore`** | Mock backend (same contract as Task 3) |
| **Feign `TaskApiClient`** | Typed setup and verification (create, get, 404) |
| **Selenium 4 + page object** | The feature under test: click Delete in the UI |

Feign does **not** replace Selenium. Delete is a UI action; Feign only seeds data and checks the
side effect against the same contract as Task 3 (`204` on delete, `404` afterwards).

## Why mock + Feign

- The UI test does not depend on a real task service or leftover data.
- Status codes and bodies stay aligned with Task 3 (`204` empty body, `404` + `{ error, details }`).
- Setup is one typed call (`tasks.create(...)`) instead of clicking through "create task" first.
- After the UI delete, Feign `GET` proves the resource is gone — not only that the row disappeared.

## Maven project

[`sample/`](./sample/) is a runnable Spring Boot 3 app (Java 21): mock REST API, Thymeleaf Delete
Task UI, Feign client and JUnit + Selenium tests.

```bash
cd bonus-tasks/junit-selenium/sample
mvn test
```

Happy path: Feign `create` → UI Delete + Confirm → row gone **and** Feign `GET` is 404.

## What I would not do

I would not call Feign `delete()` and call that a Selenium test. Selenium is there to exercise
the **web application's** Delete control, confirmation and list refresh. The mock and Feign
client make that run deterministic and typed — they are the test harness, not the feature.
