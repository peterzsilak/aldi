import type { ApiErrorContext } from "@api/generic-api-client/error-handler/error-types/api-error";

export type ApiErrorInput = ApiErrorContext & { url: string };

export interface ApiErrorHandler {
    /** Always throws: turns a failed HTTP response into a typed {@link ApiError}. */
    handleError(input: ApiErrorInput): never;
}
