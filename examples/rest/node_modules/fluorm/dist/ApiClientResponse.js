export default class ApiClientResponse {
    data = undefined;
    status = undefined;
    error = undefined;
    _model;
    _client;
    constructor(model, client) {
        this._model = model;
        this._client = client;
        return this;
    }
    toModel() {
        if (this.data?.data) {
            if (Array.isArray(this.data.data)) {
                return this.data.data.map((item) => {
                    return new this._model(this._client, item);
                });
            }
            return new this._model(this._client, this.data.data);
        }
    }
}
