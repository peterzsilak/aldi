export { ApiError, type ApiErrorContext, type ApiErrorInit } from "@api/generic-api-client/error-handler/error-types/api-error";
export {
    BadRequestError,
    ClientError,
    ConflictError,
    ForbiddenError,
    MethodNotAllowedError,
    NotFoundError,
    TooManyRequestsError,
    UnauthorizedError,
    UnprocessableEntityError,
} from "@api/generic-api-client/error-handler/error-types/client-error";
export {
    BadGatewayError,
    GatewayTimeoutError,
    InternalServerError,
    NotImplementedError,
    ServerError,
    ServiceUnavailableError,
} from "@api/generic-api-client/error-handler/error-types/server-error";
