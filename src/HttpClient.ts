export class HttpClient {
  private static cache: Map<string, CacheData> = new Map();

  static options: HttpClientOptions = {
    baseUrl: '',
    request: {
      options: {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    } as unknown as Request,
    requestInterceptor: undefined,
    responseInterceptor: undefined,
    errorInterceptor: undefined,
    requestHandler: undefined,
    cacheOptions: {
      enabled: false,
      ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
    }
  }

  static configure(opts: Partial<HttpClientOptions>) {
    this.options = { ...this.options, ...opts }
  }

  static deleteCache(url: string) {
    this.cache.delete(url);
  }

  static clearCache() {
    this.cache.clear();
  }

  static getCache<T = any>(url: string): CacheData {
    return this.cache.get(url) as CacheData
  }

  static async call<T = any>(
    url: string,
    options?: RequestOptions
  ): Promise<Response<T>> {
    if (!this.options.baseUrl) {
      throw new Error('baseUrl is required')
    }

    // Check cache if enabled
    if (this.options.cacheOptions?.enabled) {
      const cachedData = this.cache.get(url);
      if (cachedData) {
        const now = Date.now();
        if (now - cachedData.timestamp < (this.options.cacheOptions.ttl || 0)) {
          return cachedData.data as Response<T>;
        }
        // Remove expired cache entry
        this.cache.delete(url);
      }
    }

    const finalOptions = { ...options, ...this.options?.request?.options } as RequestOptions
    const request = { url:`${this.options.baseUrl}/${url}`, options: finalOptions } as Request

    if (this.options.requestInterceptor) {
      Object.assign(request, this.options.requestInterceptor.call(this, request))
    }

    let response = {} as unknown as Response<T>

    if (this.options.requestHandler) {
      response = await this.options.requestHandler.call(this, request)
    } else {
      if (request.options.headers && request.options.headers['Content-Type'] === 'application/json') {
        request.options.body = JSON.stringify(request.options.body)
      }

      const resp = await fetch(request.url, request.options as RequestInit);
      if (resp.ok) {
        response = await resp.json() as Response<T>;
      }
    }

    if (this.options.responseInterceptor) {
      response = this.options.responseInterceptor.call(this, response)
    }

    // Store in cache if enabled
    if (this.options.cacheOptions?.enabled) {
      this.cache.set(url, {
        data: response,
        timestamp: Date.now()
      });
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
  request?: Request,
  requestInterceptor?: (request: Request) => Request
  responseInterceptor?: (response: Response) => Response
  errorInterceptor?: (error: Error) => void
  requestHandler?: (request: Request) => Promise<Response>
  cacheOptions?: CacheOptions
}

interface CacheOptions {
  enabled: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface Request {
  url: string
  options: RequestOptions
}

export type Response<T = any> = T | T[]

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