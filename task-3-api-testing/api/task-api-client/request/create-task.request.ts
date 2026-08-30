import type { TaskStatus } from "@test-types/task";

export interface CreateTaskRequest {
    title: string;
    description?: string;
    status?: TaskStatus;
}
