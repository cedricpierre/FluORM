import { describe, it, expect, vi, beforeEach } from 'vitest'
import { User } from '../examples/models/User'
import { FluORM } from '../src/index'
import { Media } from '../examples/models/Media'
import { Thumbnail } from '../examples/models/Thumbnail'

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

  it('can create a user with a thumbnail', async () => {
    const thumbnail1 = new Thumbnail({ id: '1', size: 'sm', url: 'https://example.com/photo1.jpg' })
    const thumbnail2 = new Thumbnail({ id: '2', size: 'md', url: 'https://example.com/photo2.jpg' })
    user = new User({ id: '123', name: 'Cedric', email: 'cedric@example.com' })
    user.thumbnail = thumbnail1
    user.thumbnails = [thumbnail1, thumbnail2]


    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric')
    expect(user.thumbnail).toBeInstanceOf(Thumbnail)
    expect(user.thumbnails).toBeInstanceOf(Array)
    expect(user.thumbnails).toHaveLength(2)
    expect(user.thumbnails[0]).toBeInstanceOf(Thumbnail)
    expect(user.thumbnails[1]).toBeInstanceOf(Thumbnail)
  
  })

  it('can save a user', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue(1)

    await user.save()

    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric')
  })
  
  it('can fetch all users', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', name: 'Cedric', email: 'cedric@example.com' },
      { id: '2', name: 'Johana', email: 'johana@example.com' }
    ])

    const users = await User.all()

    expect(users).toHaveLength(2)
    expect(users[0]).toBeInstanceOf(User)
    expect(users[0].name).toBe('Cedric')
  })

  it('can find a user by ID', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue({
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
    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', name: 'Photo 1', url: 'https://example.com/photo1.jpg' },
      { id: '2', name: 'Photo 2', url: 'https://example.com/photo2.jpg' }
    ])

    medias = await user.medias.all()

    expect(medias).toBeInstanceOf(Array)
    expect(medias).toHaveLength(2)
    expect(medias.every((media: Media) => media instanceof Media)).toBe(true)

  })


  it('can fetch all medias from user with pagination', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', name: 'Photo', url: 'https://example.com/photo1.jpg' }
    ])
    medias = await user.medias.where({ name: 'Photo' }).paginate(1, 1)

    expect(medias).toBeInstanceOf(Array)
    expect(medias).toHaveLength(1)
    expect(medias.every((media: Media) => media instanceof Media)).toBe(true)
  })

  it('can find a user by its media', async () => {
    const media = medias[0]

    expect(media).toBeInstanceOf(Media)
    expect(media.id).toBe('1')
    expect(media.url).toBe('https://example.com/photo1.jpg')

    vi.spyOn(FluORM, 'call').mockResolvedValue(user)

    const newUser = await media.user.first()

    expect(newUser).toBeInstanceOf(User)
    expect(newUser.id).toBe('123')
    expect(newUser.name).toBe('Cedric')

    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', size: 'sm', url: 'https://example.com/photo1.jpg' }
    ])

    const thumbnail = await media.thumbnails.first()

    expect(thumbnail).toBeInstanceOf(Thumbnail)
    expect(thumbnail.id).toBe('1')
    expect(thumbnail.size).toBe('sm')
    expect(thumbnail.url).toBe('https://example.com/photo1.jpg')

    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', size: 'sm', url: 'https://example.com/photo1.jpg' },
      { id: '2', size: 'md', url: 'https://example.com/photo2.jpg' }
    ])

    const thumbnails = await media.thumbnails.all()

    expect(thumbnails).toBeInstanceOf(Array)
    expect(thumbnails).toHaveLength(2)
    expect(thumbnails.every((thumbnail: Thumbnail) => thumbnail instanceof Thumbnail)).toBe(true)
    
  })

  it('can find users where name is Cedric', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue([
      { id: '1', name: 'Cedric', email: 'cedric@example.com' }
    ])

    const users = await User
      .where({ name: 'Cedric' })
      .filter({ email: 'cedric@example.com' })
      .include('medias')
      .active()
      .all()

    expect(users).toHaveLength(1)
    expect(users[0]).toBeInstanceOf(User)
    expect(users[0].name).toBe('Cedric')
  })
})