export class HttpClient {
    static options = {
        baseUrl: '',
        request: undefined,
        requestInterceptor: undefined,
        responseInterceptor: undefined,
        errorInterceptor: undefined,
        requestHandler: undefined
    };
    static configure(opts) {
        this.options = { ...this.options, ...opts };
    }
    static async call(url, options) {
        if (!this.options.baseUrl) {
            throw new Error('baseUrl is required');
        }
        url = `${this.options.baseUrl}${url}`;
        const finalOptions = { ...options };
        const request = { url, options: finalOptions };
        if (this.options.requestInterceptor) {
            Object.assign(request, this.options.requestInterceptor.call(this, request));
        }
        let response = { data: null, error: null };
        if (this.options.requestHandler) {
            response = await this.options.requestHandler.call(this, request);
        }
        else {
            response = await (await fetch(request.url, request.options)).json();
        }
        if (response.error)
            throw new Error(response.error.message);
        if (this.options.responseInterceptor) {
            response = this.options.responseInterceptor.call(this, response);
        }
        return response.data;
    }
}
export const Methods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
};
