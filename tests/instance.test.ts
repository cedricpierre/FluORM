import { describe, it, expect, vi, beforeEach } from 'vitest'
import { User } from '../examples/models/User'
import { FluORM } from '../src/index'
import { Media } from '../examples/models/Media'
import { Thumbnail } from '../examples/models/Thumbnail'

let user: User = new User({ id: '123', name: 'Cedric', email: 'cedric@example.com' })
const baseUrl = 'http://localhost:3000'
FluORM.configure({
  baseUrl
})

describe('Models', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })


  it('can save a user', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue({ data: { id: '123', name: 'Cedric created' }, error: undefined })

    await user.save()

    expect(user).toBeInstanceOf(User)
    expect(user.id).toBe('123')
    expect(user.name).toBe('Cedric created')
  })

  it('can update an instance of a user', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue({ data: { id: '123', name: 'Cedric updated' }, error: undefined })

    await user.update({ name: 'Cedric updated' })

    expect(user.name).toBe('Cedric updated')
  })

  it('can delete an instance of a user', async () => {
    vi.spyOn(FluORM, 'call').mockResolvedValue({ data: undefined, error: undefined })

    await user.delete()
  })
})