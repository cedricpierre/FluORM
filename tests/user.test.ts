import { describe, it, expect, vi, beforeEach } from 'vitest'
import { User } from '../examples/models/User'
import { HttpClient } from '../src/HttpClient'
import { Media } from '../examples/models/Media'

describe('User Model', () => {
  beforeEach(() => {
   // vi.restoreAllMocks()
  })

  // it('can fetch all users', async () => {
  //   vi.spyOn(HttpClient, 'call').mockResolvedValue([
  //     { id: '1', name: 'Cedric', email: 'cedric@example.com' },
  //     { id: '2', name: 'Johana', email: 'johana@example.com' }
  //   ])

  //   const users = await User.all()

  //   expect(users).toHaveLength(2)
  //   expect(users[0]).toBeInstanceOf(User)
  //   expect(users[0].name).toBe('Cedric')
  // })

  // it('can find a user by ID', async () => {
  //   vi.spyOn(HttpClient, 'call').mockResolvedValue({
  //     id: '123',
  //     name: 'Cedric',
  //     email: 'cedric@example.com'
  //   })

  //   const user = await User.find('123')

  //   expect(user).toBeInstanceOf(User)
  //   expect(user.id).toBe('123')
  //   expect(user.name).toBe('Cedric')
  // })

  it('can find a user by ID and return all medias', async () => {
    vi.spyOn(HttpClient, 'call').mockResolvedValue({
      id: '123',
      name: 'Cedric',
      email: 'cedric@example.com',
    })

    const user = await User.find('123')

    // vi.spyOn(HttpClient, 'call').mockResolvedValue([
    //   { id: '1', name: 'Photo 1', url: 'https://example.com/photo1.jpg' },
    //   { id: '2', name: 'Photo 2', url: 'https://example.com/photo2.jpg' }
    // ])

    // const medias = await user.medias().all()

    // expect(medias[0]).toBeInstanceOf(Media)
    // expect(medias[0].id).toBe('1')
    // expect(medias[0].url).toBe('https://example.com/photo1.jpg')
  })
})