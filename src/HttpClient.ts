import { defaultOptions, type HttpClientOptions } from './HttpClientOptions'

export const Methods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type MethodType = keyof typeof Methods;

export type RequestHandler = <T = any>(
  url: string,
  options?: { method?: MethodType; body?: any }
) => Promise<T>

export class HttpClient {
  static options: HttpClientOptions = defaultOptions

  static configure(opts: Partial<HttpClientOptions>) {
    this.options = { ...this.options, ...opts }
  }

  static async call<T = any>(
    url: string,
    options?: { method?: MethodType; body?: any }
  ): Promise<T> {
    url = `${this.options.baseUrl ?? ''}${url}`

    const finalOptions = {
      method: options?.method ?? Methods.GET,
      body: options?.body,
      headers: { ...this.options.headers }
    }

    if (this.options.requestInterceptor) {
      const intercepted = this.options.requestInterceptor(url, finalOptions)
      url = intercepted.url
      Object.assign(finalOptions, intercepted.options)
    }

    const { data, error } = await (await fetch(this.options.baseUrl + url, finalOptions)).json();

    if (error) throw new Error(error.message)
    let response = data as T

    if (this.options.responseInterceptor) {
      response = await this.options.responseInterceptor(response)
    }

    return response
  }
}
