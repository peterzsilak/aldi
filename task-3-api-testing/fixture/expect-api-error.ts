import type { ApiError } from "@api/generic-api-client/error-handler/error-types/api-error";
import { expect } from "@playwright/test";

type ApiErrorClass<T extends ApiError> = new (...args: ConstructorParameters<typeof ApiError>) => T;

/**
 * Asserts that an API client call rejects with the expected typed error and
 * returns it, so that the test can keep asserting on status and body.
 */
export async function expectApiError<T extends ApiError>(promise: Promise<unknown>, errorClass: ApiErrorClass<T>): Promise<T> {
    const outcome = await promise.then(() => undefined).catch((reason: unknown) => reason);

    expect(outcome, `the call should reject with ${errorClass.name}`).toBeInstanceOf(errorClass);

    return outcome as T;
}
