import { startMockTaskApi, type MockTaskApi } from "@mock/task-api-server";
import { expect, request, test as base, type APIRequestContext, type APIResponse } from "@playwright/test";
import type { CreateTaskPayload, Task } from "@test-types/task";

export interface ApiWorkerFixtures {
    /** The mock task API, started once per worker. */
    mockTaskApi: MockTaskApi;
}

export interface ApiFixtures {
    /** Request context bound to the mock API, with an empty store for every test. */
    taskApi: APIRequestContext;
    /** Creates a task through the API and asserts that it was accepted. */
    createTask: (overrides?: CreateTaskPayload) => Promise<Task>;
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
    mockTaskApi: [
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

    createTask: async ({ taskApi }, use) => {
        await use(async (overrides: CreateTaskPayload = {}) => {
            const response = await taskApi.post("/tasks", {
                data: { title: "Write API tests", description: "Cover the task management endpoints", ...overrides },
            });

            expect(response.status(), "task creation should succeed").toBe(201);

            return (await response.json()) as Task;
        });
    },
});

export async function asTask(response: APIResponse): Promise<Task> {
    return (await response.json()) as Task;
}

export { expect };
