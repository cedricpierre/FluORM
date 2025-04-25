import Model from "./Model";
import type ApiClient from "./ApiClient";
export type ApiResponse<T> = {
    data: ApiDataResponse<T>;
    error: Error | undefined;
    status: number | undefined;
};
export type ApiDataPagination = {
    per_page: number;
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
};
export type ApiDataResponse<T> = {
    data: T | T[] | undefined;
} & Partial<ApiDataPagination>;
export default class ApiClientResponse<K extends typeof Model, T = {}> {
    data?: ApiDataResponse<T>;
    status?: number;
    error?: Error;
    private _model;
    private _client;
    constructor(model: K, client: ApiClient<K>);
    toModel(): InstanceType<K> | InstanceType<K>[] | undefined;
}
