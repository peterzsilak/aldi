import { expect, test } from "@fixture/api";
import type { ApiErrorBody, Task } from "@test-types/task";

test.describe("PUT /tasks/{id}", () => {
    test("returns 200 and replaces the mutable fields", async ({ taskApi, createTask }) => {
        const created = await createTask({ title: "Draft release notes", status: "todo" });

        const response = await taskApi.put(`/tasks/${created.id}`, {
            data: { title: "Publish release notes", description: "Include the changelog", status: "done" },
        });

        expect(response.status()).toBe(200);

        const updated = (await response.json()) as Task;

        expect(updated.id).toBe(created.id);
        expect(updated.createdAt).toBe(created.createdAt);
        expect(updated.title).toBe("Publish release notes");
        expect(updated.description).toBe("Include the changelog");
        expect(updated.status).toBe("done");
        expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
    });

    test("persists the update", async ({ taskApi, createTask }) => {
        const created = await createTask();

        const updated = await (await taskApi.put(`/tasks/${created.id}`, { data: { title: "Updated title" } })).json();

        const response = await taskApi.get(`/tasks/${created.id}`);

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual(updated);
    });

    test("replaces the whole resource, resetting omitted fields to their defaults", async ({ taskApi, createTask }) => {
        const created = await createTask({ title: "Full replace", description: "Original", status: "in_progress" });

        const response = await taskApi.put(`/tasks/${created.id}`, { data: { title: "Only the title" } });

        expect(response.status()).toBe(200);

        const updated = (await response.json()) as Task;

        expect(updated.description).toBe("");
        expect(updated.status).toBe("todo");
    });

    test("rejects a missing title with 400", async ({ taskApi, createTask }) => {
        const created = await createTask({ title: "Keep me" });

        const response = await taskApi.put(`/tasks/${created.id}`, { data: { description: "no title" } });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("title is required and must be a non-empty string");

        const unchanged = (await (await taskApi.get(`/tasks/${created.id}`)).json()) as Task;

        expect(unchanged).toEqual(created);
    });

    test("rejects an unknown status with 400", async ({ taskApi, createTask }) => {
        const created = await createTask();

        const response = await taskApi.put(`/tasks/${created.id}`, { data: { title: "Valid", status: "cancelled" } });

        expect(response.status()).toBe(400);
        expect(((await response.json()) as ApiErrorBody).details).toContain("status must be one of: todo, in_progress, done");
    });

    test("returns 404 for an unknown id", async ({ taskApi }) => {
        const response = await taskApi.put("/tasks/00000000-0000-0000-0000-000000000000", { data: { title: "Ghost" } });

        expect(response.status()).toBe(404);
        expect(((await response.json()) as ApiErrorBody).error).toBe("Not Found");
    });
});
