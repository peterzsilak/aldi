export interface ApiCallResult<TBody = unknown> {
    url: string;
    status: number;
    ok: boolean;
    headers: Record<string, string>;
    /** Parsed body when the response is JSON, the raw text otherwise. */
    body: TBody;
    rawText: string;
    /** Number of attempts it took to obtain this result. */
    attempts: number;
    elapsedMs: number;
}
