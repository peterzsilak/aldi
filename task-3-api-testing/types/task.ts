export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskPayload {
    title?: unknown;
    description?: unknown;
    status?: unknown;
}

export type UpdateTaskPayload = CreateTaskPayload;

export interface ApiErrorBody {
    error: string;
    details: string[];
}

export const TASK_STATUSES: readonly TaskStatus[] = ["todo", "in_progress", "done"];
