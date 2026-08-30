import { expect, test } from "@fixture/api";
import type { ApiErrorBody, Task } from "@test-types/task";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

test.describe("POST /tasks", () => {
    test("creates a task and returns 201 with the created resource", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", {
            data: { title: "Buy milk", description: "2 litres of whole milk" },
        });

        expect(response.status()).toBe(201);
        expect(response.headers()["content-type"]).toContain("application/json");

        const task = (await response.json()) as Task;

        expect(task.id).toMatch(UUID_PATTERN);
        expect(task.title).toBe("Buy milk");
        expect(task.description).toBe("2 litres of whole milk");
        expect(task.status).toBe("todo");
        expect(task.createdAt).toBe(task.updatedAt);
        expect(response.headers()["location"]).toBe(`/tasks/${task.id}`);
    });

    test("accepts an explicit status and trims the title", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", {
            data: { title: "   Review pull request   ", status: "in_progress" },
        });

        expect(response.status()).toBe(201);

        const task = (await response.json()) as Task;

        expect(task.title).toBe("Review pull request");
        expect(task.status).toBe("in_progress");
        expect(task.description).toBe("");
    });

    test("makes the created task retrievable", async ({ taskApi }) => {
        const created = (await (await taskApi.post("/tasks", { data: { title: "Ship the release" } })).json()) as Task;

        const response = await taskApi.get(`/tasks/${created.id}`);

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual(created);
    });

    test("rejects a missing title with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", { data: { description: "No title here" } });

        expect(response.status()).toBe(400);

        const body = (await response.json()) as ApiErrorBody;

        expect(body.error).toBe("Bad Request");
        expect(body.details).toContain("title is required and must be a non-empty string");
    });

    test("rejects a blank title with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", { data: { title: "   " } });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toHaveLength(1);
    });

    test("rejects an unknown status with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", { data: { title: "Valid title", status: "archived" } });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("status must be one of: todo, in_progress, done");
    });

    test("rejects a malformed JSON body with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", {
            headers: { "content-type": "application/json" },
            data: Buffer.from("{ not json"),
        });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("request body must be valid JSON");
    });

    test("rejects a non-object JSON body with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", {
            headers: { "content-type": "application/json" },
            data: Buffer.from("[]"),
        });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("request body must be a JSON object");
    });

    test("rejects an empty body with 400", async ({ taskApi }) => {
        const response = await taskApi.post("/tasks", {
            headers: { "content-type": "application/json" },
            data: Buffer.from(""),
        });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("request body must be a JSON object");
    });

    test("does not store a task when validation fails", async ({ taskApi }) => {
        await taskApi.post("/tasks", { data: { description: "orphan" } });

        const response = await taskApi.get("/tasks");

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual([]);
    });
});
