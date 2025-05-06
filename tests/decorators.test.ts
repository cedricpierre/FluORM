import { describe, it, expect, vi, beforeEach } from 'vitest'
import { User } from '../examples/models/User'
import { FluORM, HttpClient } from '../src/index'
import { Media } from '../examples/models/Media'

const baseUrl = 'http://localhost:3000'
FluORM.configure({
  baseUrl
})

describe('Models', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  
  it('should be able to get medias from a user', async () => {

    vi.spyOn(HttpClient, 'call').mockResolvedValue([
        { id: 1, name: 'Media 1' },
        { id: 2, name: 'Media 2' },
      ])

    const media = await User.id(1).medias.all()
    expect(media).toBeInstanceOf(Array)
    expect(media).toHaveLength(2)
    expect(media[0]).toBeInstanceOf(Media)
  })
  
  it('should be able to get libraries (custom name) from a user', async () => {

    vi.spyOn(HttpClient, 'call')
    .mockImplementation((url) => {
      
      expect(url).toBe('users/1/medias')
      
      return Promise.resolve([
        { id: 1, name: 'Media 1' },
        { id: 2, name: 'Media 2' },
      ])
    });

    const media = await User.id(1).libraries.all()
    expect(media).toBeInstanceOf(Array)
    expect(media).toHaveLength(2)
    expect(media[0]).toBeInstanceOf(Media)
  })
  
})