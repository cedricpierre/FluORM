export declare class HttpClient {
    static options: HttpClientOptions;
    static configure(opts: Partial<HttpClientOptions>): void;
    static call<T = any>(url: string, options?: RequestOptions): Promise<T>;
}
export declare const Methods: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly PATCH: "PATCH";
    readonly DELETE: "DELETE";
    readonly HEAD: "HEAD";
    readonly OPTIONS: "OPTIONS";
};
export type MethodType = keyof typeof Methods;
interface HttpClientOptions {
    baseUrl?: string;
    request?: RequestOptions;
    requestInterceptor?: (request: Request) => Request;
    responseInterceptor?: (response: Response) => Response;
    errorInterceptor?: (error: Error) => void;
    requestHandler?: (request: Request) => Promise<Response>;
}
export interface Request {
    url: string;
    options: RequestOptions;
}
export interface Response<T = any> {
    data: T;
    error?: Error;
}
export interface RequestOptions {
    body?: any;
    method?: MethodType;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    cache?: RequestCache;
    keepalive?: boolean;
    signal?: AbortSignal;
}
export {};
