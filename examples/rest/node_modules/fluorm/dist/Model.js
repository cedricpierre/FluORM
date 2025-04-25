/**
 * Represents a generic model class with attributes, payloads for creation and updating, and methods for interacting with an API client.
 *
 * @template Attributes - The type of the model's attributes. Defaults to an object with an `id` property of type `BigInt` or `string`.
 * @template CreatePayload - The type of the payload used for creating a new model instance. Defaults to the `Attributes` type without the `id` property.
 * @template UpdatePayload - The type of the payload used for updating an existing model instance. Defaults to the `Attributes` type without the `id` property.
 */
export default class Model {
    _id;
    static entity;
    _client;
    constructor(client, attributes) {
        this.setAttributes(attributes);
        this.client = client;
    }
    set id(id) {
        this._id = id.toString();
    }
    get id() {
        return this._id;
    }
    /**
     * Sets the client instance.
     *
     * @param {ApiClient<typeof Model> | undefined} client - The client object to be set. This must be an instance of `ApiClient` with a specific `Model` type or `undefined`.
     */
    set client(client) {
        if (client) {
            this._client = client.from(this.constructor);
        }
    }
    /**
     * Retrieves the instance of the ApiClient associated with the specified model type.
     *
     * @return {ApiClient<typeof Model>} The configured ApiClient instance.
     * @throws {Error} If the ApiClient has not been set.
     */
    get client() {
        if (!this._client) {
            throw new Error("ApiClient is not set!");
        }
        return this._client;
    }
    setAttributes(attributes) {
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
    async find(model, id) {
        return await this.client
            .from(model)
            .id(id)
            .get();
    }
    /**
     * Fetches all records based on the provided query parameters.
     *
     * @template T - The type of the model.
     * @param {typeof Model} model - The model to fetch all records from.
     * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
     * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models or raw data.
     */
    async all(model, params = {}) {
        return await this.client.from(model).get(params);
    }
    /**
     * Saves the current model instance by updating or creating it based on the presence of an identifier.
     *
     * @template T - The type of the model.
     * @param {typeof Model} model - The model to save.
     * @param {CreatePayload} [attributes] - The attributes to update on the model instance.
     * @return {Promise<Model<T>>} A promise resolving to the updated or created model instance.
     */
    async save(attributes) {
        let response;
        if (attributes) {
            this.setAttributes(attributes);
        }
        if (this._id) {
            response = await this.client
                .from(this.constructor)
                .id(this._id)
                .put(this);
        }
        else {
            response = await this.client
                .from(this.constructor)
                .post(this);
        }
        this.setAttributes(response.data?.data);
        return response;
    }
    /**
     * Updates the current model instance with the provided attributes by making an API request.
     *
     * @param {K} attributes - The attributes to update the model instance.
     * @return {Promise<Model<K>>} - A promise that resolves to the updated model instance.
     * @throws {Error} - Throws an error if the current model instance does not have an ID.
     */
    async update(attributes) {
        if (!this._id) {
            throw new Error("Cannot update a record without an ID");
        }
        this.setAttributes(attributes);
        await this.client
            .from(this.constructor)
            .id(this._id)
            .put(this);
        return this;
    }
    /**
     * Deletes the current record using its ID.
     * Throws an error if the ID is not set.
     *
     * @return {Promise<Model<K>>} A promise that resolves to the current object after successful deletion.
     */
    async delete() {
        if (!this._id) {
            throw new Error("Cannot delete a record without an ID. Please set the ID before deleting the record.");
        }
        await this.client
            .from(this.constructor)
            .id(this._id)
            .delete();
        return this;
    }
    /**
     * Converts the model instance to a plain object.
     *
     * @return {Attributes} A plain object representation of the model instance.
     */
    static async find(client, id) {
        return await new this(client).find(this.constructor, id);
    }
    /**
     * Fetches all records based on the provided query parameters.
     *
     * @param {QueryParams} [params={}] - Optional query parameters to filter or modify the data retrieval.
     * @return {Promise<any[] | Model<K>[]>} Returns a promise that resolves to an array of models
     */
    static async all(client, params = {}) {
        return await new this(client).all(this.constructor, params);
    }
}
