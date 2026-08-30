import { type ApiErrorMetadata, HttpErrorCategory } from "@api/generic-api-client/enum/http-error-category";

const RETRYABLE_STATUS_CODES = new Set([
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
]);

export class HttpErrorClassifier {
    public getCategory(status: number): HttpErrorCategory {
        if (status >= 300 && status < 400) {
            return HttpErrorCategory.Redirection;
        }

        if (status >= 400 && status < 500) {
            return HttpErrorCategory.ClientError;
        }

        if (status >= 500 && status < 600) {
            return HttpErrorCategory.ServerError;
        }

        return HttpErrorCategory.Unknown;
    }

    public getMetadata(status: number): ApiErrorMetadata {
        return {
            category: this.getCategory(status),
            retryable: this.isRetryable(status),
        };
    }

    public isRetryable(status: number): boolean {
        return RETRYABLE_STATUS_CODES.has(status);
    }
}
