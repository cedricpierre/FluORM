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
export default class Model<Attributes extends ModelAttributes = any, CreatePayload extends Partial<Omit<Attributes, "id">> = any, UpdatePayload extends Partial<Omit<Attributes, "id">> = any> implements ModelAttributes {
    private _id?;
    static entity: string;
    private _client?;
    constructor(client?: ApiClient<typeof Model>, attributes?: CreatePayload);
    set id(id: BigInt | number | string);
    get id(): string | undefined;
    /**
     * Sets the client instance.
     *
     * @param {ApiClient<typeof Model> | undefined} client - The client object to be set. This must be an instance of `ApiClient` with a specific `Model` type or `undefined`.
     */
    set client(client: ApiClient<typeof Model> | undefined);
    /**
     * Retrieves the instance of the ApiClient associated with the specified model type.
     *
     * @return {ApiClient<typeof Model>} The configured ApiClient instance.
     * @throws {Error} If the ApiClient has not been set.
     */
    get client(): ApiClient<typeof Model>;
    private setAttributes;
    /**
     * Finds a model instance by its ID.
     *
     * @template T - The type of the model.
     * @param {typeof Model} model - The model to find.
     * @param {BigInt | number | string} id - The ID of the model instance to find.
     * @returns {Promise<any | Model<T> | undefined>} A promise that resolves to the model instance if found, or undefined if not found.
     */
    find<T extends Attributes>(model: typeof Model, id: BigInt | number | string): Promise<ApiClientResponse<typeof Model>>;
    /**
     * Fetches all records based on the provided query parameters.
     *
     * @template T - The type of the model.
     * @param {typeof Model} model - The model to fetch all records from.
     * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
     * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models or raw data.
     */
    all<T extends Attributes>(model: typeof Model, params?: QueryParams): Promise<ApiClientResponse<typeof Model>>;
    /**
     * Saves the current model instance by updating or creating it based on the presence of an identifier.
     *
     * @template T - The type of the model.
     * @param {typeof Model} model - The model to save.
     * @param {CreatePayload} [attributes] - The attributes to update on the model instance.
     * @return {Promise<Model<T>>} A promise resolving to the updated or created model instance.
     */
    save<T extends Attributes>(attributes?: CreatePayload): Promise<ApiClientResponse<typeof Model>>;
    /**
     * Updates the current model instance with the provided attributes by making an API request.
     *
     * @param {K} attributes - The attributes to update the model instance.
     * @return {Promise<Model<K>>} - A promise that resolves to the updated model instance.
     * @throws {Error} - Throws an error if the current model instance does not have an ID.
     */
    update<T extends Attributes>(attributes: UpdatePayload): Promise<this>;
    /**
     * Deletes the current record using its ID.
     * Throws an error if the ID is not set.
     *
     * @return {Promise<Model<K>>} A promise that resolves to the current object after successful deletion.
     */
    delete(): Promise<this>;
    /**
     * Converts the model instance to a plain object.
     *
     * @return {Attributes} A plain object representation of the model instance.
     */
    static find<T>(client: ApiClient<typeof Model>, id: number | string | BigInt): Promise<ApiClientResponse<typeof Model>>;
    /**
     * Fetches all records based on the provided query parameters.
     *
     * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
     * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models
     */
    static all<T extends typeof Model>(client: ApiClient<typeof Model>, params?: QueryParams): Promise<ApiClientResponse<typeof Model>>;
}
