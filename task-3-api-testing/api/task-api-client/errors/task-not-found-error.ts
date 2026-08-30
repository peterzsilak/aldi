import { NotFoundError } from "@api/generic-api-client/error-handler/error-types/client-error";

/** Raised when the task service answers `404` for a task id. */
export class TaskNotFoundError extends NotFoundError {}
