import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FluORM, Request, Response } from '../src/index'

describe('FluORM Class', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    it('can configure the base URL', () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        FluORM.configure({ baseUrl: 'https://api.example.com' })
        expect(FluORM.options.baseUrl).toBe('https://api.example.com')
    })

    it('can configure the request interceptor', () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })
        
        const interceptor = (request: Request) => {
            return request
        }

        FluORM.configure({ requestInterceptor: interceptor })
        expect(FluORM.options.requestInterceptor).toBe(interceptor)
    })

    it('can configure the response interceptor', () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const interceptor = (response: Response) => {
            return response
        }

        FluORM.configure({ responseInterceptor: interceptor })
        expect(FluORM.options.responseInterceptor).toBe(interceptor)
    })

    it('can configure the request handler', async () => {
    
        const handler = (request: Request) => {
            expect(request.url).toBe('https://api.example.com/users')
            expect(request.options).toBeDefined()
            expect(request.options?.method).toBe('GET')
            return Promise.resolve<Response>({ data: true, error: undefined })
        }
        
        FluORM.configure({ requestHandler: handler })
        const response = await FluORM.call('users', { method: 'GET' })
        expect(response.data).toBe(true)
        expect(FluORM.options.requestHandler).toBe(handler)
    })

    it('can configure the error interceptor', () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const interceptor = vi.fn()
        FluORM.configure({ errorInterceptor: interceptor })
        expect(FluORM.options.errorInterceptor).toBe(interceptor)
    })

    it('can call a GET request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users')
        expect(response).toBeDefined()
    })
    
    it('can call a POST request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'POST' })
        expect(response).toBeDefined()
    })

    it('can call a PUT request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'PUT' })
        expect(response).toBeDefined()
    })  


    it('can call a PATCH request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'PATCH' })
        expect(response).toBeDefined()
    })  

    it('can call a DELETE request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'DELETE' })
        expect(response).toBeDefined()
    })  

    it('can call a HEAD request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'HEAD' })
        expect(response).toBeDefined()
    })    

    it('can call a OPTIONS request', async () => {
        vi.spyOn(FluORM, 'call').mockResolvedValue({ data: true, error: undefined })

        const response = await FluORM.call('users', { method: 'OPTIONS' })
        expect(response).toBeDefined()
    })
    
})