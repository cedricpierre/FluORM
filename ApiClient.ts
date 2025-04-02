import Model from "./Model";
import ApiClientResponse, { type ApiDataResponse } from "./ApiClientResponse";

export interface QueryParams {
	limit?: number;
	paginate?: boolean;
	page?: number;
	"include[]"?: string;
	"sort[field]"?: string;
	"sort[direction]"?: "ASC" | "DESC";

	[key: string]: any;
}

enum ApiRequestMethods {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	DELETE = "DELETE",
}

export type RequestOptions = {
	headers?: Record<string, string>;
};

export default class ApiClient<K extends typeof Model> {
	public static baseUrl: string = "";
	private _entity?: string;
	private _path: string = "";
	private _options: RequestOptions = {};
	private _model?: typeof Model;

	constructor(options: RequestOptions = {}) {
		this._options = options;

		return this;
	}

	private reset() {
		this._entity = undefined;
		this._path += "";
		this._options = {};
	}

	public static async update(
		model: typeof Model,
		id: BigInt | number | string,
		payload: any,
	): Promise<ApiClientResponse<typeof Model>> {
		return await new this().resource(model).id(id).put(payload);
	}

	public static async all(
		model: typeof Model,
		params: QueryParams = {},
	): Promise<ApiClientResponse<typeof Model>> {
		return new this().resource(model).get(params);
	}

	public static async find(
		model: typeof Model,
		id: BigInt | number | string,
	): Promise<ApiClientResponse<typeof Model>> {
		return await new this().resource(model).id(id).get();
	}

	public async find<T>(id: BigInt | number | string): Promise<ApiClientResponse<K, T | T[]>> {
		return await this.id(id).get<T>();
	}

	public async all<T>(params: QueryParams = {}): Promise<ApiClientResponse<K, T | T[]>> {
		return await this.get<T>(params);
	}

	public from(model: typeof Model): this {
		this.reset();
		this._model = model;
		this._entity = model.entity;
		this._path = `/${model.entity}`;
		return this;
	}

	public resource<T extends typeof Model>(resource: string | number | T): this {
		if ((resource as any).prototype && (resource as any).prototype instanceof Model) {
			if (!this._model) {
				return this.from(resource as T);
			}
			this._path += `/${(resource as T).entity}`;
		} else {
			this._path += `/${resource}`;
		}
		return this;
	}

	public id<T extends typeof Model>(id: BigInt | number | string): this {
		return this.resource<T>(id.toString());
	}

	public setHeaders(headers: Record<string, string>): this {
		this._options.headers = { ...this._options.headers, ...headers };
		return this;
	}

	public async get<T>(params?: QueryParams): Promise<ApiClientResponse<K, T | T[]>> {
		return await this.makeRequest<T>(ApiRequestMethods.GET, undefined, params);
	}

	public async post<T, A>(body: A): Promise<ApiClientResponse<K, T>> {
		return await this.makeRequest<T, A>(ApiRequestMethods.POST, body);
	}

	public async put<T, A>(body: A): Promise<ApiClientResponse<K, T>> {
		return await this.makeRequest<T, A>(ApiRequestMethods.PUT, body);
	}

	public async delete(): Promise<ApiClientResponse<K>> {
		return await this.makeRequest(ApiRequestMethods.DELETE);
	}

	private buildUrl(params?: QueryParams): string {
		if (!this._path) {
			throw new Error("Path has not been set.");
		}

		let url = `${(this.constructor as typeof ApiClient).baseUrl}${this._path}`;

		if (params) {
			const queryString = new URLSearchParams(params).toString();
			url += `?${queryString}`;
		}
		return url;
	}

	private async makeRequest<T, A = {}>(
		method: ApiRequestMethods,
		body?: A,
		params?: QueryParams,
	): Promise<ApiClientResponse<K, T>> {
		if (!(this.constructor as typeof ApiClient).baseUrl) {
			throw new Error("Base URL is not set. Please set baseUrl before making requests.");
		}

		const url = this.buildUrl(params);
		const clientResponse = new ApiClientResponse<K, T>(this._model as K, this);

		try {
			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					...(this._options.headers || {}),
				},
				body: body ? JSON.stringify(body) : undefined,
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			clientResponse.data = data as ApiDataResponse<T>;
			clientResponse.status = response.status;
		} catch (error) {
			clientResponse.error = error as Error;
		}


		this.reset();

		return clientResponse;
	}
}
