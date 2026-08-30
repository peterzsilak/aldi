export enum HttpErrorCategory {
    Redirection = "redirection",
    ClientError = "client-error",
    ServerError = "server-error",
    Unknown = "unknown",
}

export interface ApiErrorMetadata {
    category: HttpErrorCategory;
    retryable: boolean;
}
