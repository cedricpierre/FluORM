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
	public data?: ApiDataResponse<T> = undefined;
	public status?: number = undefined;
	public error?: Error = undefined;

	private _model: K;
	private _client: ApiClient<K>;

	constructor(model: K, client: ApiClient<K>) {
		this._model = model;
		this._client = client;
		return this;
	}

	public toModel(): InstanceType<K> | InstanceType<K>[] | undefined {
		if (this.data?.data) {
			if (Array.isArray(this.data.data)) {
				return this.data.data.map((item: any) => {
					return new (this._model as K)(this._client, item);
				}) as InstanceType<K>[];
			}

			return new (this._model as K)(this._client, this.data.data) as InstanceType<K>;
		}
	}
}
