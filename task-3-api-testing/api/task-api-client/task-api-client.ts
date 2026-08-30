import type { ApiCallResult } from "@api/generic-api-client/api-call-result";
import { HttpMethod } from "@api/generic-api-client/enum/http-method";
import { GenericApiClient } from "@api/generic-api-client/generic-api-client";
import type { GenericApiClientConfig } from "@api/generic-api-client/generic-api-client-config";
import type { CreateTaskRequest } from "@api/task-api-client/request/create-task.request";
import type { UpdateTaskRequest } from "@api/task-api-client/request/update-task.request";
import type { TaskErrorResponse, TaskListResponse, TaskResponse } from "@api/task-api-client/response/task.response";
import { createTaskApiClientConfig } from "@api/task-api-client/task-api-client-config";
import type { APIRequestContext } from "@playwright/test";

export type TaskCallResult = ApiCallResult<TaskResponse | TaskErrorResponse | string>;

const TASKS_PATH = "/tasks";

export class TaskApiClient extends GenericApiClient {
    constructor(request: APIRequestContext, config: GenericApiClientConfig | string) {
        super(request, typeof config === "string" ? createTaskApiClientConfig(config) : config);
    }

    public listTasks(): Promise<TaskListResponse> {
        return this.get<TaskListResponse>(TASKS_PATH);
    }

    public createTask(task: CreateTaskRequest): Promise<TaskResponse> {
        return this.post<TaskResponse, CreateTaskRequest>(TASKS_PATH, task);
    }

    public getTask(id: string): Promise<TaskResponse> {
        return this.get<TaskResponse>(this.taskPath(id));
    }

    public updateTask(id: string, task: UpdateTaskRequest): Promise<TaskResponse> {
        return this.put<TaskResponse, UpdateTaskRequest>(this.taskPath(id), task);
    }

    public async deleteTask(id: string): Promise<void> {
        await this.delete<string>(this.taskPath(id));
    }

    public listTasksResult(): Promise<ApiCallResult<TaskListResponse>> {
        return this.sendRaw<TaskListResponse>(HttpMethod.GET, TASKS_PATH);
    }

    /** Accepts any payload, including raw buffers, to cover malformed request bodies. */
    public createTaskResult(body: unknown): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.POST, TASKS_PATH, body as Buffer);
    }

    public getTaskResult(id: string): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.GET, this.taskPath(id));
    }

    public updateTaskResult(id: string, body: unknown): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.PUT, this.taskPath(id), body as Buffer);
    }

    public deleteTaskResult(id: string): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.DELETE, this.taskPath(id));
    }

    /** The service does not implement PATCH; used to assert the 405 contract. */
    public patchTaskResult(id: string, body: unknown): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.PATCH, this.taskPath(id), body as Buffer);
    }

    /** Reaches an arbitrary path on the service, used to assert unknown-route handling. */
    public getPathResult(path: string): Promise<TaskCallResult> {
        return this.sendRaw<TaskResponse | TaskErrorResponse | string>(HttpMethod.GET, path);
    }

    private taskPath(id: string): string {
        return `${TASKS_PATH}/${encodeURIComponent(id)}`;
    }
}
