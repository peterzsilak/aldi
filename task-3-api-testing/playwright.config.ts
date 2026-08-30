import { defineConfig } from "@playwright/test";

const isCI = Boolean(process.env["CI"]);

export default defineConfig({
    testDir: "./tests",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: isCI,
    /* Retry on CI only */
    retries: isCI ? 2 : 0,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Opt out of parallel tests on CI. */
    ...(isCI ? { workers: 1 } : {}),
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    use: {
        trace: "on-first-retry",
    },

    projects: [
        {
            name: "api",
        },
    ],
});
