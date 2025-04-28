import { Model, Attributes, HasMany, Cast } from '../../src/index'
import { Relation } from '../../src/RelationBuilder'

import { Media } from './Media'
import { Thumbnail } from './Thumbnail'

interface IUser extends Attributes {
    name: string
    email: string
    created_at?: string
    updated_at?: string
}

export class User extends Model<IUser> {
    static resource = 'users'

    @HasMany(() => Media as any)
    declare medias!: Relation<Media[]>;

    @Cast(() => Thumbnail)
    declare thumbnail!: Thumbnail

    @Cast(() => Thumbnail)
    declare thumbnails!: Thumbnail[]


    static scopes = {
        active: () => ({ status: 'active' }),
    }
}