import { ApiError } from "@api/generic-api-client/error-handler/error-types/api-error";

/** Any `5xx` response. */
export class ServerError extends ApiError {}

export class InternalServerError extends ServerError {}
export class NotImplementedError extends ServerError {}
export class BadGatewayError extends ServerError {}
export class ServiceUnavailableError extends ServerError {}
export class GatewayTimeoutError extends ServerError {}
