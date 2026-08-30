import { TaskValidationError } from "@api/task-api-client/errors/task-validation-error";
import { expect, test } from "@fixture/api";
import { expectApiError } from "@fixture/expect-api-error";
import type { ApiErrorBody, Task } from "@test-types/task";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

test.describe("POST /tasks", () => {
    test("creates a task and returns 201 with the created resource", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult({ title: "Buy milk", description: "2 litres of whole milk" });

        expect(result.status).toBe(201);
        expect(result.headers["content-type"]).toContain("application/json");

        const task = result.body as Task;

        expect(task.id).toMatch(UUID_PATTERN);
        expect(task.title).toBe("Buy milk");
        expect(task.description).toBe("2 litres of whole milk");
        expect(task.status).toBe("todo");
        expect(task.createdAt).toBe(task.updatedAt);
        expect(result.headers["location"]).toBe(`/tasks/${task.id}`);
    });

    test("accepts an explicit status and trims the title", async ({ taskApiClient }) => {
        const task = await taskApiClient.createTask({ title: "   Review pull request   ", status: "in_progress" });

        expect(task.title).toBe("Review pull request");
        expect(task.status).toBe("in_progress");
        expect(task.description).toBe("");
    });

    test("makes the created task retrievable", async ({ taskApiClient, createTask }) => {
        const created = await createTask({ title: "Ship the release" });

        await expect(taskApiClient.getTask(created.id)).resolves.toEqual(created);
    });

    test("raises a validation error for a blank title", async ({ taskApiClient }) => {
        const error = await expectApiError(taskApiClient.createTask({ title: "   " }), TaskValidationError);

        expect(error.status).toBe(400);
        expect(error.details).toEqual(["title is required and must be a non-empty string"]);
    });

    test("rejects a missing title with 400", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult({ description: "No title here" });

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).error).toBe("Bad Request");
        expect((result.body as ApiErrorBody).details).toContain("title is required and must be a non-empty string");
    });

    test("rejects an unknown status with 400", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult({ title: "Valid title", status: "archived" });

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).details).toContain("status must be one of: todo, in_progress, done");
    });

    test("rejects a malformed JSON body with 400", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult(Buffer.from("{ not json"));

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).details).toContain("request body must be valid JSON");
    });

    test("rejects a non-object JSON body with 400", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult(Buffer.from("[]"));

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).details).toContain("request body must be a JSON object");
    });

    test("rejects an empty body with 400", async ({ taskApiClient }) => {
        const result = await taskApiClient.createTaskResult(Buffer.from(""));

        expect(result.status).toBe(400);
        expect((result.body as ApiErrorBody).details).toContain("request body must be a JSON object");
    });

    test("does not store a task when validation fails", async ({ taskApiClient }) => {
        await taskApiClient.createTaskResult({ description: "orphan" });

        await expect(taskApiClient.listTasks()).resolves.toEqual([]);
    });
});
