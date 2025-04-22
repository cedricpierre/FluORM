import { Methods } from "./HttpClient";

export interface HttpClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
  requestInterceptor?: (
    url: string,
    options?: { method?: Method; body?: any }
  ) => { url: string; options?: { method?: Method; body?: any } }
  responseInterceptor?: <T = any>(response: T) => T | Promise<T>
}

export const defaultOptions: HttpClientOptions = {
  baseUrl: '',
  headers: {},
  requestInterceptor: undefined,
  responseInterceptor: undefined
}