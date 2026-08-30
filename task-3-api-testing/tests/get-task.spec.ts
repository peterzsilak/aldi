import { TaskNotFoundError } from "@api/task-api-client/errors/task-not-found-error";
import { expect, test } from "@fixture/api";
import { expectApiError } from "@fixture/expect-api-error";
import type { ApiErrorBody } from "@test-types/task";

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

test.describe("GET /tasks/{id}", () => {
    test("returns 200 with the stored task", async ({ taskApiClient, createTask }) => {
        const created = await createTask({ title: "Prepare demo", status: "done" });

        const result = await taskApiClient.getTaskResult(created.id);

        expect(result.status).toBe(200);
        expect(result.headers["content-type"]).toContain("application/json");
        expect(result.body).toEqual(created);
    });

    test("is idempotent", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        const first = await taskApiClient.getTask(created.id);
        const second = await taskApiClient.getTask(created.id);

        expect(first).toEqual(second);
        expect(first).toEqual(created);
    });

    test("raises a not found error for an unknown id", async ({ taskApiClient }) => {
        const error = await expectApiError(taskApiClient.getTask(UNKNOWN_ID), TaskNotFoundError);

        expect(error.status).toBe(404);
        expect((error.body as ApiErrorBody).error).toBe("Not Found");
        expect((error.body as ApiErrorBody).details).toContain(`No task with id ${UNKNOWN_ID}`);
    });

    test("returns 404 for an unknown resource path", async ({ taskApiClient }) => {
        const result = await taskApiClient.getPathResult("/unknown");

        expect(result.status).toBe(404);
        expect((result.body as ApiErrorBody).error).toBe("Not Found");
    });

    test("returns every created task on the collection endpoint", async ({ taskApiClient, createTask }) => {
        const first = await createTask({ title: "First" });
        const second = await createTask({ title: "Second" });

        await expect(taskApiClient.listTasks()).resolves.toEqual([first, second]);
    });

    test("rejects an unsupported method with 405", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        const result = await taskApiClient.patchTaskResult(created.id, { title: "Patched" });

        expect(result.status).toBe(405);
        expect(result.headers["allow"]).toBe("GET, PUT, DELETE");
    });
});
