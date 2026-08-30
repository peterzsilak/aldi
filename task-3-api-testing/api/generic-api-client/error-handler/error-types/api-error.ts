import { type ApiErrorMetadata, HttpErrorCategory } from "@api/generic-api-client/enum/http-error-category";

export interface ApiErrorRequestContext {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
}

export interface ApiErrorResponseContext {
    status: number;
    headers: Record<string, string>;
    body: unknown;
    rawText: string;
}

export interface ApiErrorContext {
    request: ApiErrorRequestContext;
    response: ApiErrorResponseContext;
}

export interface ApiErrorInit {
    url: string;
    context: ApiErrorContext;
    meta?: Partial<ApiErrorMetadata>;
}

/**
 * Base class of every error raised by the API clients. It keeps the full
 * request/response context so that assertions and logs stay meaningful.
 */
export class ApiError extends Error {
    public readonly url: string;
    public readonly context: ApiErrorContext;
    public readonly category: HttpErrorCategory;
    public readonly retryable: boolean;

    constructor(message: string, init: ApiErrorInit) {
        super(message);

        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);

        this.url = init.url;
        this.context = init.context;
        this.category = init.meta?.category ?? HttpErrorCategory.Unknown;
        this.retryable = init.meta?.retryable ?? false;
    }

    public get status(): number {
        return this.context.response.status;
    }

    public get body(): unknown {
        return this.context.response.body;
    }

    public get headers(): Record<string, string> {
        return this.context.response.headers;
    }

    public get rawText(): string {
        return this.context.response.rawText;
    }
}
