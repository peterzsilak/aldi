import { ApiError } from "@api/generic-api-client/error-handler/error-types/api-error";

/** Any `4xx` response. */
export class ClientError extends ApiError {}

export class BadRequestError extends ClientError {}
export class UnauthorizedError extends ClientError {}
export class ForbiddenError extends ClientError {}
export class NotFoundError extends ClientError {}
export class MethodNotAllowedError extends ClientError {}
export class ConflictError extends ClientError {}
export class UnprocessableEntityError extends ClientError {}
export class TooManyRequestsError extends ClientError {}
