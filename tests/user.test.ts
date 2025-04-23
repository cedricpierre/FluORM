import { describe, it, expect, vi, beforeEach } from 'vitest'
import { User } from '../examples/models/User'
import { HttpClient } from '../src/HttpClient'
import { Media } from '../examples/models/Media'

let user: User
let medias: Media[]

describe('User Model', () => {
  beforeEach(() => {
   vi.restoreAllMocks()
  })

  it('can create a user', async () => {
    user = new User({ id: '123', name: 'Cedric', email: 'cedric@example.com' })
    
    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric')
  
  })

  it('can save a user', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue(1)

    await user.save()

    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric')
  })
  
  it('can fetch all users', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue([
      { id: '1', name: 'Cedric', email: 'cedric@example.com' },
      { id: '2', name: 'Johana', email: 'johana@example.com' }
    ])

    const users = await User.all()

    expect(users).toHaveLength(2)
    expect(users[0]).toBeInstanceOf(User)
    expect(users[0].name).toBe('Cedric')
  })

  it('can find a user by ID', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue({
      id: '123',
      name: 'Cedric',
      email: 'cedric@example.com'
    })

    user = await User.find('123')

    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric')
  })

  it('can fetch all medias from user', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue([
      { id: '1', name: 'Photo 1', url: 'https://example.com/photo1.jpg' },
      { id: '2', name: 'Photo 2', url: 'https://example.com/photo2.jpg' }
    ])

    medias = await user.medias.all()
    
    expect(medias).toBeInstanceOf(Array)
    expect(medias).toHaveLength(2)
    expect(medias.every((media: Media) => media instanceof Media)).toBe(true)

  })


  it('can fetch all medias from user with pagination', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue([
      { id: '1', name: 'Photo 1', url: 'https://example.com/photo1.jpg' }
    ])

    medias = await user.medias.paginate(1, 1)

    expect(medias).toBeInstanceOf(Array)
    expect(medias).toHaveLength(1)
    expect(medias.every((media: Media) => media instanceof Media)).toBe(true)

  })

  it('can find a user by its media', async () => {
    const media = medias[0]

    expect(media).toBeInstanceOf(Media)
    expect(media.id).toBe('1')
    expect(media.url).toBe('https://example.com/photo1.jpg')

    vi.spyOn(HttpClient, 'call').mockResolvedValue(user)

    const newUser = await media.user.first()

    expect(newUser).toBeInstanceOf(User)
    expect(newUser.id).toBe('123')
    expect(newUser.name).toBe('Cedric')
  })
})