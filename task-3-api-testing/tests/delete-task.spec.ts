import { expect, test } from "@fixture/api";
import type { ApiErrorBody, Task } from "@test-types/task";

test.describe("DELETE /tasks/{id}", () => {
    test("returns 204 with an empty body", async ({ taskApi, createTask }) => {
        const created = await createTask();

        const response = await taskApi.delete(`/tasks/${created.id}`);

        expect(response.status()).toBe(204);
        expect(await response.text()).toBe("");
    });

    test("makes the task unavailable afterwards", async ({ taskApi, createTask }) => {
        const created = await createTask();

        await taskApi.delete(`/tasks/${created.id}`);

        const response = await taskApi.get(`/tasks/${created.id}`);

        expect(response.status()).toBe(404);
    });

    test("returns 404 when deleting the same task twice", async ({ taskApi, createTask }) => {
        const created = await createTask();

        expect((await taskApi.delete(`/tasks/${created.id}`)).status()).toBe(204);

        const response = await taskApi.delete(`/tasks/${created.id}`);

        expect(response.status()).toBe(404);
        expect(((await response.json()) as ApiErrorBody).error).toBe("Not Found");
    });

    test("returns 404 for an unknown id", async ({ taskApi }) => {
        const response = await taskApi.delete("/tasks/00000000-0000-0000-0000-000000000000");

        expect(response.status()).toBe(404);
    });

    test("leaves the other tasks untouched", async ({ taskApi, createTask }) => {
        const doomed = await createTask({ title: "Delete me" });
        const survivor = await createTask({ title: "Keep me" });

        await taskApi.delete(`/tasks/${doomed.id}`);

        const response = await taskApi.get("/tasks");
        const remaining = (await response.json()) as Task[];

        expect(response.status()).toBe(200);
        expect(remaining).toEqual([survivor]);
    });
});
