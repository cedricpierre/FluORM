import Model from "./Model";
import ApiClientResponse from "./ApiClientResponse";
export interface QueryParams {
    limit?: number;
    paginate?: boolean;
    page?: number;
    "include[]"?: string;
    "sort[field]"?: string;
    "sort[direction]"?: "ASC" | "DESC";
    [key: string]: any;
}
export type RequestOptions = {
    headers?: Record<string, string>;
};
export default class ApiClient<K extends typeof Model> {
    static baseUrl: string;
    private _entity?;
    private _path;
    private _options;
    private _model?;
    constructor(options?: RequestOptions);
    private reset;
    static update(model: typeof Model, id: BigInt | number | string, payload: any): Promise<ApiClientResponse<typeof Model>>;
    static all(model: typeof Model, params?: QueryParams): Promise<ApiClientResponse<typeof Model>>;
    static find(model: typeof Model, id: BigInt | number | string): Promise<ApiClientResponse<typeof Model>>;
    find<T>(id: BigInt | number | string): Promise<ApiClientResponse<K, T | T[]>>;
    all<T>(params?: QueryParams): Promise<ApiClientResponse<K, T | T[]>>;
    from(model: typeof Model): this;
    resource<T extends typeof Model>(resource: string | number | T): this;
    id<T extends typeof Model>(id: BigInt | number | string): this;
    setHeaders(headers: Record<string, string>): this;
    get<T>(params?: QueryParams): Promise<ApiClientResponse<K, T | T[]>>;
    post<T, A>(body: A): Promise<ApiClientResponse<K, T>>;
    put<T, A>(body: A): Promise<ApiClientResponse<K, T>>;
    delete(): Promise<ApiClientResponse<K>>;
    private buildUrl;
    private makeRequest;
}
