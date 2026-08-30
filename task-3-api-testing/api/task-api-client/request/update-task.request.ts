import type { CreateTaskRequest } from "@api/task-api-client/request/create-task.request";

/** `PUT /tasks/{id}` replaces the resource, so it takes the same shape as create. */
export type UpdateTaskRequest = CreateTaskRequest;
