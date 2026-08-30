import type { ApiCallResult } from "@api/generic-api-client/api-call-result";
import { ApiRequestBuilder, type QueryParams } from "@api/generic-api-client/api-request-builder";
import { HttpMethod } from "@api/generic-api-client/enum/http-method";
import type { ApiErrorHandler } from "@api/generic-api-client/error-handler/api-error-handler";
import { GenericApiErrorHandler } from "@api/generic-api-client/error-handler/generic-api-error-handler";
import type { GenericApiClientConfig } from "@api/generic-api-client/generic-api-client-config";
import type { ApiLogger } from "@api/generic-api-client/logger/api-logger";
import { createApiLogger } from "@api/generic-api-client/logger/api-logger-factory";
import type { APIRequestContext } from "@playwright/test";

export interface RequestOptions {
    params?: QueryParams;
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * Base class for every API client. Service specific clients extend it, pass
 * their own config and expose domain methods on top of the protected verbs.
 */
export class GenericApiClient {
    protected static readonly CONTENT_TYPE_JSON = "application/json";
    protected static readonly ACCEPT_JSON = "application/json, text/plain, */*";

    protected readonly request: APIRequestContext;
    protected readonly config: GenericApiClientConfig;
    protected readonly logger: ApiLogger;
    protected readonly errorHandler: ApiErrorHandler;
    protected readonly basePath: string;

    constructor(request: APIRequestContext, config: GenericApiClientConfig) {
        this.request = request;
        this.config = config;
        this.basePath = config.basePath;
        this.logger = createApiLogger(this.constructor.name, config);
        this.errorHandler = config.errorHandler ?? new GenericApiErrorHandler();
    }

    protected get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
        return this.builder<TResponse>(HttpMethod.GET, path, undefined, options).send();
    }

    protected post<TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions): Promise<TResponse> {
        return this.builder<TResponse, TBody>(HttpMethod.POST, path, body, options).send();
    }

    protected put<TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions): Promise<TResponse> {
        return this.builder<TResponse, TBody>(HttpMethod.PUT, path, body, options).send();
    }

    protected patch<TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestOptions): Promise<TResponse> {
        return this.builder<TResponse, TBody>(HttpMethod.PATCH, path, body, options).send();
    }

    protected delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
        return this.builder<TResponse>(HttpMethod.DELETE, path, undefined, options).send();
    }

    /** Same as the verbs above, but returns the raw result instead of throwing. */
    protected sendRaw<TResponse, TBody = unknown>(
        method: HttpMethod,
        path: string,
        body?: TBody | Buffer | string,
        options?: RequestOptions,
    ): Promise<ApiCallResult<TResponse>> {
        return this.builder<TResponse, TBody>(method, path, body, options).sendRaw();
    }

    protected builder<TResponse = unknown, TBody = unknown>(
        method: HttpMethod,
        path: string,
        body?: TBody | Buffer | string,
        options?: RequestOptions,
    ): ApiRequestBuilder<TResponse, TBody> {
        const builder = new ApiRequestBuilder<TResponse, TBody>(this.request, (target, params) => this.buildUrl(target, params), method)
            .setPath(path)
            .setHeaders(this.buildHeaders(options?.headers))
            .setLogger(this.logger)
            .setErrorHandler(this.errorHandler);

        const timeout = options?.timeout ?? this.config.timeout;

        if (timeout !== undefined) {
            builder.setTimeout(timeout);
        }

        if (this.config.retry) {
            builder.setRetry(this.config.retry);
        }

        if (options?.params) {
            builder.setParams(options.params);
        }

        if (body !== undefined) {
            builder.setData(body);
        }

        return builder;
    }

    protected buildHeaders(extra?: Record<string, string>): Record<string, string> {
        return {
            Accept: GenericApiClient.ACCEPT_JSON,
            "Content-Type": GenericApiClient.CONTENT_TYPE_JSON,
            ...this.config.defaultHeaders,
            ...extra,
        };
    }

    protected buildUrl(path: string, params?: QueryParams): string {
        const url = new URL(path, this.basePath);

        for (const [key, value] of Object.entries(params ?? {})) {
            this.appendParam(url, key, value);
        }

        return url.toString();
    }

    private appendParam(url: URL, key: string, value: unknown): void {
        if (value === undefined || value === null) {
            return;
        }

        const values = Array.isArray(value) ? value : [value];

        for (const item of values) {
            if (item !== undefined && item !== null) {
                url.searchParams.append(key, String(item));
            }
        }
    }
}
