import { expect, test } from "@fixture/api";
import type { ApiErrorBody, Task } from "@test-types/task";

test.describe("GET /tasks/{id}", () => {
    test("returns 200 with the stored task", async ({ taskApi, createTask }) => {
        const created = await createTask({ title: "Prepare demo", status: "done" });

        const response = await taskApi.get(`/tasks/${created.id}`);

        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toContain("application/json");

        const task = (await response.json()) as Task;

        expect(task).toEqual(created);
        expect(task.status).toBe("done");
    });

    test("is idempotent", async ({ taskApi, createTask }) => {
        const created = await createTask();

        const first = await taskApi.get(`/tasks/${created.id}`);
        const second = await taskApi.get(`/tasks/${created.id}`);

        expect(first.status()).toBe(200);
        expect(second.status()).toBe(200);
        expect(await first.json()).toEqual(await second.json());
    });

    test("returns 404 for an unknown id", async ({ taskApi }) => {
        const response = await taskApi.get("/tasks/00000000-0000-0000-0000-000000000000");

        expect(response.status()).toBe(404);

        const body = (await response.json()) as ApiErrorBody;

        expect(body.error).toBe("Not Found");
        expect(body.details).toContain("No task with id 00000000-0000-0000-0000-000000000000");
    });

    test("returns 404 for an unknown resource path", async ({ taskApi }) => {
        const response = await taskApi.get("/unknown");

        expect(response.status()).toBe(404);
        expect(((await response.json()) as ApiErrorBody).error).toBe("Not Found");
    });

    test("returns every created task on the collection endpoint", async ({ taskApi, createTask }) => {
        const first = await createTask({ title: "First" });
        const second = await createTask({ title: "Second" });

        const response = await taskApi.get("/tasks");

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual([first, second]);
    });

    test("rejects an unsupported method with 405", async ({ taskApi, createTask }) => {
        const created = await createTask();

        const response = await taskApi.patch(`/tasks/${created.id}`, { data: { title: "Patched" } });

        expect(response.status()).toBe(405);
        expect(response.headers()["allow"]).toBe("GET, PUT, DELETE");
    });
});
