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
})