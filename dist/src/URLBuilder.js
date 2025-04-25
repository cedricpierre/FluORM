export class URLBuilder {
    path;
    queryParams = {};
    constructor(base) {
        this.path = base;
    }
    query(params) {
        this.queryParams = { ...this.queryParams, ...params };
        return this;
    }
    toString() {
        const query = new URLSearchParams(this.queryParams).toString();
        const url = query ? `${this.path}?${query}` : this.path;
        return decodeURIComponent(url);
    }
}
