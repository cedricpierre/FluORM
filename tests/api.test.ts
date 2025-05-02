
import { expect, describe, it, vi } from 'vitest'
import { User } from '../examples/models/User'
import { FluORM, HttpClient } from '../src'

FluORM.configure({
    baseUrl: 'https://jsonplaceholder.typicode.com'
})


describe('API', () => { 
    it('should fetch all users', async () => {

        const users = await User.all()
        expect(users).toBeDefined()
    })

    it('should fetch a user by id', async () => {
        const user = await User.find(1)
        expect(user).toBeDefined()
    })

    it('should create a user', async () => {
        const user = await User.create({ name: 'Cedric', email: 'cedric@example.com' })

        expect(user).toBeDefined()
        expect(user).toBeInstanceOf(User)
        expect(user.name).toBe('Cedric')
        expect(user.email).toBe('cedric@example.com')
    })

    it('should update a user', async () => {
        const user = await User.update(1, { name: 'Cedric updated' })
        expect(user).toBeDefined()
        expect(user).toBeInstanceOf(User)
        expect(user.name).toBe('Cedric updated')
    })
    
    
})





