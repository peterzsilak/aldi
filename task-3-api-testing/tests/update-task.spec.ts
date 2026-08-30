import { TaskNotFoundError } from "@api/task-api-client/errors/task-not-found-error";
import { TaskValidationError } from "@api/task-api-client/errors/task-validation-error";
import { expect, test } from "@fixture/api";
import { expectApiError } from "@fixture/expect-api-error";
import type { ApiErrorBody, Task } from "@test-types/task";

const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

test.describe("PUT /tasks/{id}", () => {
    test("returns 200 and replaces the mutable fields", async ({ taskApiClient, createTask }) => {
        const created = await createTask({ title: "Draft release notes", status: "todo" });

        const result = await taskApiClient.updateTaskResult(created.id, {
            title: "Publish release notes",
            description: "Include the changelog",
            status: "done",
        });

        expect(result.status).toBe(200);

        const updated = result.body as Task;

        expect(updated.id).toBe(created.id);
        expect(updated.createdAt).toBe(created.createdAt);
        expect(updated.title).toBe("Publish release notes");
        expect(updated.description).toBe("Include the changelog");
        expect(updated.status).toBe("done");
        expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
    });

    test("persists the update", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        const updated = await taskApiClient.updateTask(created.id, { title: "Updated title" });

        await expect(taskApiClient.getTask(created.id)).resolves.toEqual(updated);
    });

    test("replaces the whole resource, resetting omitted fields to their defaults", async ({ taskApiClient, createTask }) => {
        const created = await createTask({ title: "Full replace", description: "Original", status: "in_progress" });

        const updated = await taskApiClient.updateTask(created.id, { title: "Only the title" });

        expect(updated.description).toBe("");
        expect(updated.status).toBe("todo");
    });

    test("raises a validation error and keeps the task untouched when the title is missing", async ({ taskApiClient, createTask }) => {
        const created = await createTask({ title: "Keep me" });

        const error = await expectApiError(taskApiClient.updateTask(created.id, { description: "no title" } as never), TaskValidationError);

        expect(error.status).toBe(400);
        expect(error.details).toContain("title is required and must be a non-empty string");

        await expect(taskApiClient.getTask(created.id)).resolves.toEqual(created);
    });

    test("rejects an unknown status with 400", async ({ taskApiClient, createTask }) => {
        const created = await createTask();

        const result = await taskApiClient.updateTaskResult(created.id, { title: "Valid", status: "cancelled" });

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).details).toContain("status must be one of: todo, in_progress, done");
    });

    test("raises a not found error for an unknown id", async ({ taskApiClient }) => {
        const error = await expectApiError(taskApiClient.updateTask(UNKNOWN_ID, { title: "Ghost" }), TaskNotFoundError);

        expect(error.status).toBe(404);
        expect((error.body as ApiErrorBody).error).toBe("Not Found");
    });
});
