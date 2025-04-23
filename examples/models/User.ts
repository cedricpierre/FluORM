import { HasMany } from './../../src/decorators'
import { Media } from './Media'
import { BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'
import { type Attributes } from '../../src/BaseModel'

interface IUser extends Attributes {
    name: string
    email: string
    created_at?: string
    updated_at?: string
}

export class User extends BaseModel<IUser> {
    static resource = 'users'

    @HasMany(() => Media as any)
    declare medias: Relation<Media[]>;

    static scopes = {
        active: () => ({ status: 'active' }),
    }
}