import { BadRequestError } from "@api/generic-api-client/error-handler/error-types/client-error";
import type { ApiErrorBody } from "@test-types/task";

/** Raised when the task service rejects a payload with `400`. */
export class TaskValidationError extends BadRequestError {
    /** Field level messages returned by the service, empty when unavailable. */
    public get details(): string[] {
        const body = this.body as Partial<ApiErrorBody> | undefined;

        return Array.isArray(body?.details) ? body.details : [];
    }
}
