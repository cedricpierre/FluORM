export class HttpClient {
  static options: HttpClientOptions = {
    baseUrl: '',
    request: undefined,
    requestInterceptor: undefined,
    responseInterceptor: undefined,
    errorInterceptor: undefined,
    requestHandler: undefined
  }

  static configure(opts: Partial<HttpClientOptions>) {
    this.options = { ...this.options, ...opts }
  }

  static async call<T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<Response<T>> {

    if (!this.options.baseUrl) {
      throw new Error('baseUrl is required')
    }

    url = `${this.options.baseUrl}/${url}`

    const finalOptions = { ...options } as RequestOptions
    const request = { url, options: finalOptions } as Request

    if (this.options.requestInterceptor) {
      Object.assign(request, this.options.requestInterceptor.call(this, request))
    }

    let response = { data: null, error: null } as unknown as Response<T>

    if (this.options.requestHandler) {
      response = await this.options.requestHandler.call(this, request)
    } else {
      const resp = await fetch(request.url, request.options as RequestInit);
      if (resp.ok) {
        response = await resp.json() as Response<T>;
      }
    }

    if (response.error) throw new Error(response.error.message)
  
    if (this.options.responseInterceptor) {
      response = this.options.responseInterceptor.call(this, response)
    }
    
    return response
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
} as const;

export type MethodType = keyof typeof Methods;


interface HttpClientOptions {
  baseUrl?: string
  request?: RequestOptions,
  requestInterceptor?: (request: Request) => Request
  responseInterceptor?: (response: Response) => Response
  errorInterceptor?: (error: Error) => void
  requestHandler?: (request: Request) => Promise<Response>
}


export interface Request {
  url: string
  options: RequestOptions
}

export interface Response<T = any> {
  data: T
  error?: Error
}

export interface RequestOptions {
  body?: any,
  method?: MethodType,
  headers?: Record<string, string>
  credentials?: RequestCredentials
  mode?: RequestMode
  redirect?: RequestRedirect
  referrer?: string
  referrerPolicy?: ReferrerPolicy
  integrity?: string
  cache?: RequestCache
  keepalive?: boolean
  signal?: AbortSignal
}