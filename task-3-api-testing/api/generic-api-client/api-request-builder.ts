import type { ApiCallResult } from "@api/generic-api-client/api-call-result";
import type { HttpMethod } from "@api/generic-api-client/enum/http-method";
import type { ApiErrorHandler } from "@api/generic-api-client/error-handler/api-error-handler";
import { HttpErrorClassifier } from "@api/generic-api-client/error-handler/http-error-classifier";
import type { ApiLogger } from "@api/generic-api-client/logger/api-logger";
import { DEFAULT_RETRY_OPTIONS, type RetryOptions } from "@api/generic-api-client/retry-options";
import type { APIRequestContext, APIResponse } from "@playwright/test";

export type QueryParams = Record<string, unknown>;
export type BuildUrl = (path: string, params?: QueryParams) => string;

/**
 * Fluent builder around Playwright's {@link APIRequestContext}. It owns the
 * cross-cutting concerns of a call: URL building, logging, retries and turning
 * failed responses into typed errors.
 */
export class ApiRequestBuilder<TResponse = unknown, TBody = unknown> {
    private static readonly classifier = new HttpErrorClassifier();

    private method: HttpMethod;
    private path = "";
    private headers: Record<string, string> = {};
    private data?: TBody | Buffer | string;
    private params?: QueryParams;
    private timeout?: number;
    private retryOptions: RetryOptions = { ...DEFAULT_RETRY_OPTIONS };
    private logger?: ApiLogger;
    private errorHandler?: ApiErrorHandler;

    constructor(
        private readonly request: APIRequestContext,
        private readonly buildUrl: BuildUrl,
        method: HttpMethod,
    ) {
        this.method = method;
    }

    public setMethod(method: HttpMethod): this {
        this.method = method;

        return this;
    }

    public setPath(path: string): this {
        this.path = path;

        return this;
    }

    public setHeaders(headers: Record<string, string>): this {
        this.headers = { ...this.headers, ...headers };

        return this;
    }

    public setData(data: TBody | Buffer | string): this {
        this.data = data;

        return this;
    }

    public setParams(params: QueryParams): this {
        this.params = params;

        return this;
    }

    public setTimeout(timeout: number): this {
        this.timeout = timeout;

        return this;
    }

    public setRetry(options: Partial<RetryOptions>): this {
        this.retryOptions = { ...this.retryOptions, ...options };

        return this;
    }

    public setLogger(logger: ApiLogger): this {
        this.logger = logger;

        return this;
    }

    public setErrorHandler(errorHandler: ApiErrorHandler): this {
        this.errorHandler = errorHandler;

        return this;
    }

    /**
     * Sends the request and returns the raw result, retrying retryable statuses.
     * Never throws for HTTP errors, which makes it the right tool for negative tests.
     */
    public async sendRaw(): Promise<ApiCallResult<TResponse>> {
        const url = this.buildUrl(this.path, this.params);
        const { maxAttempts } = this.retryOptions;
        const startedAt = Date.now();

        let result = await this.attempt(url, 1, startedAt);

        for (let attempt = 2; attempt <= maxAttempts && this.shouldRetry(result); attempt++) {
            await this.waitBeforeRetry(attempt, url, result.status);
            result = await this.attempt(url, attempt, startedAt);
        }

        return result;
    }

    /**
     * Sends the request and returns the parsed body, delegating failed responses
     * to the configured {@link ApiErrorHandler}.
     */
    public async send(): Promise<TResponse> {
        const result = await this.sendRaw();

        if (result.ok) {
            return result.body;
        }

        this.logger?.error(`${this.method} ${result.url} failed with status ${result.status}`, { body: result.body });

        const errorHandler = this.errorHandler;

        if (!errorHandler) {
            throw new Error(`HTTP ${result.status} ${result.url}: ${result.rawText}`);
        }

        errorHandler.handleError({
            url: result.url,
            request: { method: this.method, url: result.url, headers: this.headers, body: this.data },
            response: { status: result.status, headers: result.headers, body: result.body, rawText: result.rawText },
        });

        throw new Error(`${this.constructor.name}: the error handler did not throw for status ${result.status}`);
    }

    private async attempt(url: string, attempt: number, startedAt: number): Promise<ApiCallResult<TResponse>> {
        this.logger?.debug(`Request: ${this.method} ${url}`, { attempt, headers: this.headers, body: this.data });

        const response = await this.request.fetch(url, {
            method: this.method,
            headers: this.headers,
            ...(this.data === undefined ? {} : { data: this.data }),
            ...(this.timeout === undefined ? {} : { timeout: this.timeout }),
        });

        const { body, rawText } = await this.parseBody(response);
        const result: ApiCallResult<TResponse> = {
            url: response.url(),
            status: response.status(),
            ok: response.ok(),
            headers: response.headers(),
            body: body as TResponse,
            rawText,
            attempts: attempt,
            elapsedMs: Date.now() - startedAt,
        };

        this.logger?.debug(`Response: ${result.status} ${result.url}`, { attempt, elapsedMs: result.elapsedMs, body: result.body });

        return result;
    }

    private async parseBody(response: APIResponse): Promise<{ body: unknown; rawText: string }> {
        const rawText = await response.text();

        if (!(response.headers()["content-type"] ?? "").includes("application/json")) {
            return { body: rawText, rawText };
        }

        try {
            return { body: JSON.parse(rawText), rawText };
        } catch {
            return { body: rawText, rawText };
        }
    }

    private shouldRetry(result: ApiCallResult<TResponse>): boolean {
        return !result.ok && ApiRequestBuilder.classifier.isRetryable(result.status);
    }

    private async waitBeforeRetry(nextAttempt: number, url: string, status: number): Promise<void> {
        const delayMs = this.calculateDelayMs(nextAttempt - 1);

        this.logger?.warn(`Retrying ${this.method} ${url} after status ${status}`, {
            nextAttempt,
            maxAttempts: this.retryOptions.maxAttempts,
            delayMs,
        });

        if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    private calculateDelayMs(previousAttempt: number): number {
        const { delayMs, backoffFactor } = this.retryOptions;

        if (delayMs <= 0) {
            return 0;
        }

        return backoffFactor <= 1 ? delayMs : Math.round(delayMs * backoffFactor ** Math.max(0, previousAttempt - 1));
    }
}
