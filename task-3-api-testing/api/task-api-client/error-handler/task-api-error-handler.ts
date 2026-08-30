import type { HttpErrorCategory } from "@api/generic-api-client/enum/http-error-category";
import type { ApiError } from "@api/generic-api-client/error-handler/error-types/api-error";
import { GenericApiErrorHandler } from "@api/generic-api-client/error-handler/generic-api-error-handler";
import { TaskNotFoundError } from "@api/task-api-client/errors/task-not-found-error";
import { TaskValidationError } from "@api/task-api-client/errors/task-validation-error";

type ApiErrorConstructor = new (...args: ConstructorParameters<typeof ApiError>) => ApiError;

const TASK_ERROR_MAP: Record<number, ApiErrorConstructor> = {
    400: TaskValidationError,
    404: TaskNotFoundError,
};

/** Promotes the generic HTTP errors of the task service to domain errors. */
export class TaskApiErrorHandler extends GenericApiErrorHandler {
    protected override resolveErrorClass(status: number, category: HttpErrorCategory): ApiErrorConstructor {
        return TASK_ERROR_MAP[status] ?? super.resolveErrorClass(status, category);
    }
}
