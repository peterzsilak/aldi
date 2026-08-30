import { randomUUID } from "node:crypto";
import { TASK_STATUSES, type CreateTaskPayload, type Task, type TaskStatus, type UpdateTaskPayload } from "@test-types/task";

export interface NormalisedTaskPayload {
    title: string;
    description: string;
    status: TaskStatus;
}

/**
 * In-memory data store behind the mocked task management API.
 * Every worker gets its own instance, and it is reset between tests.
 */
export class TaskStore {
    private readonly tasks = new Map<string, Task>();
    private lastTimestamp = 0;

    public reset(): void {
        this.tasks.clear();
    }

    public list(): Task[] {
        return [...this.tasks.values()];
    }

    public find(id: string): Task | undefined {
        return this.tasks.get(id);
    }

    public create(payload: NormalisedTaskPayload): Task {
        const now = this.nextTimestamp();
        const task: Task = {
            id: randomUUID(),
            title: payload.title,
            description: payload.description,
            status: payload.status,
            createdAt: now,
            updatedAt: now,
        };

        this.tasks.set(task.id, task);

        return task;
    }

    public replace(existing: Task, payload: NormalisedTaskPayload): Task {
        const updated: Task = {
            ...existing,
            title: payload.title,
            description: payload.description,
            status: payload.status,
            updatedAt: this.nextTimestamp(),
        };

        this.tasks.set(updated.id, updated);

        return updated;
    }

    public delete(id: string): boolean {
        return this.tasks.delete(id);
    }

    /**
     * Guarantees strictly increasing timestamps so that `updatedAt` is always
     * observably newer than `createdAt`, even on fast machines.
     */
    private nextTimestamp(): string {
        const now = Math.max(Date.now(), this.lastTimestamp + 1);
        this.lastTimestamp = now;

        return new Date(now).toISOString();
    }
}

/**
 * Validates an incoming create/update payload and normalises the optional fields.
 * Returns the list of validation errors when the payload is not acceptable.
 */
export function validateTaskPayload(payload: CreateTaskPayload | UpdateTaskPayload): NormalisedTaskPayload | string[] {
    const details: string[] = [];
    const { title, description, status } = payload;

    if (typeof title !== "string" || title.trim().length === 0) {
        details.push("title is required and must be a non-empty string");
    }

    if (description !== undefined && typeof description !== "string") {
        details.push("description must be a string");
    }

    if (status !== undefined && !isTaskStatus(status)) {
        details.push(`status must be one of: ${TASK_STATUSES.join(", ")}`);
    }

    if (details.length > 0) {
        return details;
    }

    return {
        title: (title as string).trim(),
        description: typeof description === "string" ? description : "",
        status: isTaskStatus(status) ? status : "todo",
    };
}

function isTaskStatus(value: unknown): value is TaskStatus {
    return typeof value === "string" && TASK_STATUSES.includes(value as TaskStatus);
}
