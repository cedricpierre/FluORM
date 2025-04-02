import ApiClient, { type QueryParams } from "./ApiClient";
import type ApiClientResponse from "./ApiClientResponse";

export interface ModelAttributes {
	id?: number | string;
	[key: string]: any;
}

/**
 * Represents a generic model class with attributes, payloads for creation and updating, and methods for interacting with an API client.
 *
 * @template Attributes - The type of the model's attributes. Defaults to an object with an `id` property of type `BigInt` or `string`.
 * @template CreatePayload - The type of the payload used for creating a new model instance. Defaults to the `Attributes` type without the `id` property.
 * @template UpdatePayload - The type of the payload used for updating an existing model instance. Defaults to the `Attributes` type without the `id` property.
 */
export default class Model<
	Attributes extends ModelAttributes = any,
	CreatePayload extends Partial<Omit<Attributes, "id">> = any,
	UpdatePayload extends Partial<Omit<Attributes, "id">> = any,
> implements ModelAttributes
{
	private _id?: string;

	public static entity: string;

	private _client?: ApiClient<typeof Model>;

	constructor(client?: ApiClient<typeof Model>, attributes?: CreatePayload) {
		this.setAttributes(attributes);
		this.client = client;
	}

	set id(id: BigInt | number | string) {
		this._id = id.toString();
	}

	get id(): string | undefined {
		return this._id;
	}

	/**
	 * Sets the client instance.
	 *
	 * @param {ApiClient<typeof Model> | undefined} client - The client object to be set. This must be an instance of `ApiClient` with a specific `Model` type or `undefined`.
	 */
	set client(client: ApiClient<typeof Model> | undefined) {
		if (client) {
			this._client = client.from(this.constructor as typeof Model);
		}
	}

	/**
	 * Retrieves the instance of the ApiClient associated with the specified model type.
	 *
	 * @return {ApiClient<typeof Model>} The configured ApiClient instance.
	 * @throws {Error} If the ApiClient has not been set.
	 */
	get client(): ApiClient<typeof Model> {
		if (!this._client) {
			throw new Error("ApiClient is not set!");
		}
		return this._client;
	}

	private setAttributes(
		attributes?: Partial<CreatePayload | UpdatePayload | Attributes> | undefined,
	): void {
		if (attributes) {
			Object.assign(this, attributes);
		}
	}

	/**
	 * Finds a model instance by its ID.
	 *
	 * @template T - The type of the model.
	 * @param {typeof Model} model - The model to find.
	 * @param {BigInt | number | string} id - The ID of the model instance to find.
	 * @returns {Promise<any | Model<T> | undefined>} A promise that resolves to the model instance if found, or undefined if not found.
	 */
	public async find<T extends Attributes>(model: typeof Model, id: BigInt | number | string): Promise<ApiClientResponse<typeof Model>> {
		return await this.client
			.from(model as typeof Model)
			.id(id)
			.get<T>();
	}

	/**
	 * Fetches all records based on the provided query parameters.
	 *
	 * @template T - The type of the model.
	 * @param {typeof Model} model - The model to fetch all records from.
	 * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
	 * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models or raw data.
	 */
	public async all<T extends Attributes>(model: typeof Model, params: QueryParams = {}): Promise<ApiClientResponse<typeof Model>> {
		return await this.client.from(model as typeof Model).get<T[]>(params);
	}

	/**
	 * Saves the current model instance by updating or creating it based on the presence of an identifier.
	 *
	 * @template T - The type of the model.
	 * @param {typeof Model} model - The model to save.
	 * @param {CreatePayload} [attributes] - The attributes to update on the model instance.
	 * @return {Promise<Model<T>>} A promise resolving to the updated or created model instance.
	 */
	public async save<T extends Attributes>(attributes?: CreatePayload): Promise<ApiClientResponse<typeof Model>> {
		let response;

		if (attributes) {
			this.setAttributes(attributes);
		}

		if (this._id) {
			response = await this.client
				.from(this.constructor as typeof Model)
				.id(this._id)
				.put<T, UpdatePayload>(this as unknown as UpdatePayload);
		} else {
			response = await this.client
				.from(this.constructor as typeof Model)
				.post<T, CreatePayload>(this as unknown as CreatePayload);
		}

		this.setAttributes(response.data?.data as unknown as T);

		return response;
	}

	/**
	 * Updates the current model instance with the provided attributes by making an API request.
	 *
	 * @param {K} attributes - The attributes to update the model instance.
	 * @return {Promise<Model<K>>} - A promise that resolves to the updated model instance.
	 * @throws {Error} - Throws an error if the current model instance does not have an ID.
	 */
	public async update<T extends Attributes>(attributes: UpdatePayload): Promise<this> {
		if (!this._id) {
			throw new Error("Cannot update a record without an ID");
		}

		this.setAttributes(attributes);

		await this.client
			.from(this.constructor as typeof Model)
			.id(this._id)
			.put<T, UpdatePayload>(this as unknown as UpdatePayload);

		return this;
	}

	/**
	 * Deletes the current record using its ID.
	 * Throws an error if the ID is not set.
	 *
	 * @return {Promise<Model<K>>} A promise that resolves to the current object after successful deletion.
	 */
	public async delete(): Promise<this> {
		if (!this._id) {
			throw new Error(
				"Cannot delete a record without an ID. Please set the ID before deleting the record.",
			);
		}
		await this.client
			.from(this.constructor as typeof Model)
			.id(this._id)
			.delete();
		return this;
	}

	/**
	 * Converts the model instance to a plain object.
	 *
	 * @return {Attributes} A plain object representation of the model instance.
	 */
	public static async find<T>(
		client: ApiClient<typeof Model>,
		id: number | string | BigInt,
	): Promise<ApiClientResponse<typeof Model>> {
		return await new this(client).find<T>(this.constructor as typeof Model, id);
	}

	/**
	 * Fetches all records based on the provided query parameters.
	 *
	 * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
	 * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models
	 */
	public static async all<T extends typeof Model>(
		client: ApiClient<typeof Model>,
		params: QueryParams = {},
	): Promise<ApiClientResponse<typeof Model>> {
		return await new this(client).all<T>(this.constructor as typeof Model, params);
	}
}
