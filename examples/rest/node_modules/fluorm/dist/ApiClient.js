import Model from "./Model";
import ApiClientResponse from "./ApiClientResponse";
var ApiRequestMethods;
(function (ApiRequestMethods) {
    ApiRequestMethods["GET"] = "GET";
    ApiRequestMethods["POST"] = "POST";
    ApiRequestMethods["PUT"] = "PUT";
    ApiRequestMethods["DELETE"] = "DELETE";
})(ApiRequestMethods || (ApiRequestMethods = {}));
export default class ApiClient {
    static baseUrl = "";
    _entity;
    _path = "";
    _options = {};
    _model;
    constructor(options = {}) {
        this._options = options;
        return this;
    }
    reset() {
        this._entity = undefined;
        this._path += "";
        this._options = {};
    }
    static async update(model, id, payload) {
        return await new this().resource(model).id(id).put(payload);
    }
    static async all(model, params = {}) {
        return new this().resource(model).get(params);
    }
    static async find(model, id) {
        return await new this().resource(model).id(id).get();
    }
    async find(id) {
        return await this.id(id).get();
    }
    async all(params = {}) {
        return await this.get(params);
    }
    from(model) {
        this.reset();
        this._model = model;
        this._entity = model.entity;
        this._path = `/${model.entity}`;
        return this;
    }
    resource(resource) {
        if (resource.prototype && resource.prototype instanceof Model) {
            if (!this._model) {
                return this.from(resource);
            }
            this._path += `/${resource.entity}`;
        }
        else {
            this._path += `/${resource}`;
        }
        return this;
    }
    id(id) {
        return this.resource(id.toString());
    }
    setHeaders(headers) {
        this._options.headers = { ...this._options.headers, ...headers };
        return this;
    }
    async get(params) {
        return await this.makeRequest(ApiRequestMethods.GET, undefined, params);
    }
    async post(body) {
        return await this.makeRequest(ApiRequestMethods.POST, body);
    }
    async put(body) {
        return await this.makeRequest(ApiRequestMethods.PUT, body);
    }
    async delete() {
        return await this.makeRequest(ApiRequestMethods.DELETE);
    }
    buildUrl(params) {
        if (!this._path) {
            throw new Error("Path has not been set.");
        }
        let url = `${this.constructor.baseUrl}${this._path}`;
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        return url;
    }
    async makeRequest(method, body, params) {
        if (!this.constructor.baseUrl) {
            throw new Error("Base URL is not set. Please set baseUrl before making requests.");
        }
        const url = this.buildUrl(params);
        const clientResponse = new ApiClientResponse(this._model, this);
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
            clientResponse.data = data;
            clientResponse.status = response.status;
        }
        catch (error) {
            clientResponse.error = error;
        }
        this.reset();
        return clientResponse;
    }
}
