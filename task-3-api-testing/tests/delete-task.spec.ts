import { TaskNotFoundError } from "@api/task-api-client/errors/task-not-found-error";
import { expect, test } from "@fixture/api";
import { expectApiError } from "@fixture/expect-api-error";
import type { ApiErrorBody } from "@test-types/task";

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

test.describe("DELETE /tasks/{id}", () => {
    test("returns 204 with an empty body", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        const result = await taskApiClient.deleteTaskResult(created.id);

        expect(result.status).toBe(204);
        expect(result.rawText).toBe("");
    });

    test("makes the task unavailable afterwards", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        await taskApiClient.deleteTask(created.id);

        const error = await expectApiError(taskApiClient.getTask(created.id), TaskNotFoundError);

        expect(error.status).toBe(404);
    });

    test("raises a not found error when deleting the same task twice", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        await taskApiClient.deleteTask(created.id);

        const error = await expectApiError(taskApiClient.deleteTask(created.id), TaskNotFoundError);

        expect(error.status).toBe(404);
        expect((error.body as ApiErrorBody).error).toBe("Not Found");
    });

    test("returns 404 for an unknown id", async ({ taskApiClient }) => {
        const result = await taskApiClient.deleteTaskResult(UNKNOWN_ID);

        expect(result.status).toBe(404);
    });

    test("leaves the other tasks untouched", async ({ taskApiClient, createTask }) => {
        const doomed = await createTask({ title: "Delete me" });
        const survivor = await createTask({ title: "Keep me" });

        await taskApiClient.deleteTask(doomed.id);

        await expect(taskApiClient.listTasks()).resolves.toEqual([survivor]);
    });
});
