# Bonus: CI Integration

## What CI is for QA

Continuous Integration (CI) is the process of running a defined quality gate on every change,
**before** that change is merged. For tests, that means: a commit or pull request triggers a
pipeline, the pipeline installs a known toolchain, runs the same checks a developer would run
locally, and fails the change if anything is red.

The goal is not "tests exist". The goal is that **main cannot move forward on a broken build**,
and that every reviewer can see the evidence without reproducing the run on their laptop.

## Tools and process

The tool I would use here is **GitHub Actions**. It lives in the same repository as the tests,
so the pipeline is reviewed like any other code. The same idea maps to GitLab CI, Azure Pipelines
or Jenkins; the process does not.

| Step | Why it is there |
| --- | --- |
| Trigger on `push` and `pull_request` to `main` / `master` | Every commit and every PR is tested, not only a nightly job |
| Fresh `ubuntu-latest` runner | No leftover state from a previous run |
| Pin Node (`.nvmrc` / `node-version: 26`) | The pipeline matches the project runtime |
| `npm ci` | Lockfile-exact install, not `npm install` |
| Lint / typecheck before tests | Cheap failures fail fast |
| Playwright (or API) suite | The actual functional gate |
| Upload `playwright-report` as an artifact | Failures are diagnosable without re-running |
| Required status check on the PR | Merge is blocked until the workflow is green |

Around the pipeline I would also keep a **short local gate** (Husky pre-commit in Task 2) for
format/lint, and treat CI as the source of truth for the full suite. Flaky tests get quarantined
or fixed; they are not ignored by turning the gate off.

## Example used in this repository

This homework already contains two GitHub Actions workflows — one per Playwright suite:

- Task 2 (login E2E): [`task-2-frontend-testing/.github/workflows/playwright.yml`](../../task-2-frontend-testing/.github/workflows/playwright.yml)
- Task 3 (REST API): [`task-3-api-testing/.github/workflows/api-tests.yml`](../../task-3-api-testing/.github/workflows/api-tests.yml)

Both follow the same shape:

```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

That is the "run on each commit or pull request" requirement. After checkout they set up Node 26,
install with `npm ci`, run Playwright, and publish the HTML report for 30 days.

The two workflows differ where the suites differ:

| | Task 2 — frontend | Task 3 — API |
| --- | --- | --- |
| Extra install | `npx playwright install --with-deps` (real browsers) | none — `APIRequestContext` only |
| Static checks | covered by `pretest` → `npm run check` | explicit `npm run check` step |
| Test command | `npx playwright test` | `npm run test:raw` (skips the pretest double-run) |
| Working directory | implicit (workflow sits next to `package.json`) | `working-directory: task-3-api-testing` |

Task 3 also caches npm via `actions/setup-node`, which keeps API runs short. Task 2 cannot skip
the browser install: Chromium, Firefox and WebKit have to match the Playwright version.

### Wiring this monorepo

GitHub Actions only loads workflows from **`.github/workflows/` at the repository root**. The
files above are kept next to each task so the example stays readable with the suite it runs. In a
real submission I would copy (or generate) them to the root and set `defaults.run.working-directory`
(or a `working-directory:` on each step) to `task-2-frontend-testing` / `task-3-api-testing`, the
way the Task 3 workflow already does.

Branch protection would then mark both workflows as required checks, so a red login suite or a red
API suite blocks the pull request.

## Why GitHub Actions

I have used GitHub Actions for Playwright and API suites on GitHub-hosted repositories. It is the
natural fit here: the assignment is already a git repo, YAML is reviewed in the PR, secrets stay in
the repo settings, and artifacts (reports, traces) attach to the run that failed. If the team lived
in GitLab I would write the same stages in `.gitlab-ci.yml`; the process — trigger, clean install,
test, publish evidence, block merge — would be unchanged.
