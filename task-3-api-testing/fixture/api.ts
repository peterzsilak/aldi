import type { CreateTaskRequest } from "@api/task-api-client/request/create-task.request";
import { TaskApiClient } from "@api/task-api-client/task-api-client";
import { type MockTaskApi, startMockTaskApi } from "@mock/task-api-server";
import { type APIRequestContext, test as base, expect, request } from "@playwright/test";
import type { Task } from "@test-types/task";

export interface ApiWorkerFixtures {
    /** The mock task API, started once per worker. */
    mockTaskApi: MockTaskApi;
}

export interface ApiFixtures {
    /** Raw request context bound to the mock, with an empty store for every test. */
    taskApi: APIRequestContext;
    /** Task service client used by the tests. */
    taskApiClient: TaskApiClient;
    /** Creates a task through the client and asserts that it was accepted. */
    createTask: (overrides?: Partial<CreateTaskRequest>) => Promise<Task>;
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
    mockTaskApi: [
        // biome-ignore lint/correctness/noEmptyPattern: Playwright requires a destructuring pattern here.
        async ({}, use) => {
            const mock = await startMockTaskApi();

            await use(mock);

            await mock.close();
        },
        { scope: "worker" },
    ],

    taskApi: async ({ mockTaskApi }, use) => {
        mockTaskApi.store.reset();

        const context = await request.newContext({ baseURL: mockTaskApi.baseURL });

        await use(context);

        await context.dispose();
    },

    taskApiClient: async ({ taskApi, mockTaskApi }, use) => {
        await use(new TaskApiClient(taskApi, mockTaskApi.baseURL));
    },

    createTask: async ({ taskApiClient }, use) => {
        await use(async (overrides: Partial<CreateTaskRequest> = {}) => {
            const task = await taskApiClient.createTask({
                title: "Write API tests",
                description: "Cover the task management endpoints",
                ...overrides,
            });

            expect(task.id, "the created task should have an id").toBeTruthy();

            return task;
        });
    },
});

export { expect };
