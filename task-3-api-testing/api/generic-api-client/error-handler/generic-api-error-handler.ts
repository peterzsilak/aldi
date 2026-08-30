import { HttpErrorCategory } from "@api/generic-api-client/enum/http-error-category";
import type { ApiErrorHandler, ApiErrorInput } from "@api/generic-api-client/error-handler/api-error-handler";
import { ApiError } from "@api/generic-api-client/error-handler/error-types/api-error";
import {
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
import {
    BadGatewayError,
    GatewayTimeoutError,
    InternalServerError,
    NotImplementedError,
    ServerError,
    ServiceUnavailableError,
} from "@api/generic-api-client/error-handler/error-types/server-error";
import { HttpErrorClassifier } from "@api/generic-api-client/error-handler/http-error-classifier";

type ApiErrorConstructor = new (...args: ConstructorParameters<typeof ApiError>) => ApiError;

const CLIENT_ERROR_MAP: Record<number, ApiErrorConstructor> = {
    400: BadRequestError,
    401: UnauthorizedError,
    403: ForbiddenError,
    404: NotFoundError,
    405: MethodNotAllowedError,
    409: ConflictError,
    422: UnprocessableEntityError,
    429: TooManyRequestsError,
};

const SERVER_ERROR_MAP: Record<number, ApiErrorConstructor> = {
    500: InternalServerError,
    501: NotImplementedError,
    502: BadGatewayError,
    503: ServiceUnavailableError,
    504: GatewayTimeoutError,
};

/**
 * Default error handler: maps HTTP status codes onto the typed error hierarchy.
 * Service specific clients can subclass it to raise domain errors instead.
 */
export class GenericApiErrorHandler implements ApiErrorHandler {
    protected readonly classifier = new HttpErrorClassifier();

    public handleError(input: ApiErrorInput): never {
        const { url, request, response } = input;
        const meta = this.classifier.getMetadata(response.status);
        const ErrorClass = this.resolveErrorClass(response.status, meta.category);

        throw new ErrorClass(`${request.method} ${url} failed with status ${response.status}`, {
            url,
            context: { request, response },
            meta,
        });
    }

    protected resolveErrorClass(status: number, category: HttpErrorCategory): ApiErrorConstructor {
        switch (category) {
            case HttpErrorCategory.ClientError:
                return CLIENT_ERROR_MAP[status] ?? ClientError;

            case HttpErrorCategory.ServerError:
                return SERVER_ERROR_MAP[status] ?? ServerError;

            default:
                return ApiError;
        }
    }
}
