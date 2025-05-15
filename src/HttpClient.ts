export class HttpClient {
  static #cache: Map<string, CacheData> = new Map();

  static options: HttpClientOptions = {
    baseUrl: '',
    request: {
      options: {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    } as unknown as HttpRequest,
    requestInterceptor: undefined,
    responseInterceptor: undefined,
    errorInterceptor: undefined,
    requestHandler: fetchRequestHandler,
    cacheOptions: {
      enabled: false,
      ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
    }
  }

  static configure(opts: Partial<HttpClientOptions>) {
    this.options = { ...this.options, ...opts }
  }

  static deleteCache(url: string) {
    this.#cache.delete(url);
  }

  static clearCache() {
    this.#cache.clear();
  }

  static get cache() {
    return this.#cache
  }

  static getCache<T = any>(url: string): CacheData {
    return this.#cache.get(url) as CacheData
  }

  static async call<T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<HttpResponse<T>> {
    try {
      if (!this.options.baseUrl) {
        throw new Error('baseUrl is required')
      }

      // Check cache if enabled
      if (this.options.cacheOptions?.enabled) {
        const cachedData = this.#cache.get(url);
        if (cachedData) {
          const now = Date.now();
          if (now - cachedData.timestamp < (this.options.cacheOptions.ttl || 0)) {
            return cachedData.data as HttpResponse<T>;
          }
          // Remove expired cache entry
          this.#cache.delete(url);
        }
      }

      const finalOptions = { ...options, ...this.options?.request?.options } as RequestOptions
      const request = { url:`${this.options.baseUrl}/${url}`, options: finalOptions } as HttpRequest

      if (this.options.requestInterceptor) {
        Object.assign(request, this.options.requestInterceptor.call(this, request))
      }

      let response = await this.options.requestHandler!.call(this, request);

      if (this.options.responseInterceptor) {
        response = this.options.responseInterceptor.call(this, response)
      }

      // Store in cache if enabled
      if (this.options.cacheOptions?.enabled) {
        this.#cache.set(url, {
          data: response,
          timestamp: Date.now()
        });
      }
      
      return response
    } catch (error) {
      if (this.options.errorInterceptor && error instanceof Error) {
        this.options.errorInterceptor(error)
      }
      throw error
    }
  }
}

export async function fetchRequestHandler(request: HttpRequest): Promise<HttpResponse> {
  const options = { ...request.options };

  if (options.headers?.['Content-Type'] === 'application/json' && options.body) {
    options.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(request.url, options as RequestInit);
    
    return res.json();
  } catch (error) {
    throw new Error(`HTTP error: ${error}`);
  }
};

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
  request?: HttpRequest,
  requestInterceptor?: (request: HttpRequest) => HttpRequest
  responseInterceptor?: (response: HttpResponse) => HttpResponse
  errorInterceptor?: (error: Error) => void
  requestHandler?: (request: HttpRequest) => Promise<HttpResponse>
  cacheOptions?: CacheOptions
}

interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface HttpRequest {
  url: string
  options: RequestOptions
}

export type HttpResponse<T = any> = T | T[]

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

interface CacheData {
  data: any;
  timestamp: number;
}