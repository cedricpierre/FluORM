import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpClient } from '../src/HttpClient'

describe('HttpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  
  it('can make a GET request', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue({
      data: {
        message: 'Hello, world!'
      }
    })
    const response = await HttpClient.call('https://jsonplaceholder.typicode.com/posts')

    expect(response.data).not.toBeNull()
  })

  it('doest have a baseUrl', async () => {
    HttpClient.configure({ baseUrl: undefined })

    await expect(HttpClient.call('https://jsonplaceholder.typicode.com/posts')).rejects.toThrow('baseUrl is required')

  })

  it('has a baseUrl', async () => {
    HttpClient.configure({ baseUrl: 'https://jsonplaceholder.typicode.com' })

    const response = await HttpClient.call('posts')

    expect(response.data).not.toBeNull()
  })
})