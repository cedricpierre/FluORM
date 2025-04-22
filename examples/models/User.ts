import { HasMany } from './../../src/decorators'
import { Media } from './Media'
import { BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'

interface UserAttributes {
    name: string
    email: string
    created_at: string
    updated_at: string
}

export class User extends BaseModel<UserAttributes> {
    static resource = 'users'


    @HasMany(() => Media)
    medias!: () => Relation<Media[]>

    // Exemple de méthode statique pour un scope
    static scopes = {
        active: () => ({ status: 'active' }),
        createdAfter: (date: string) => ({ created_at: { $gte: date } })
    }
}