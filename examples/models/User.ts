import { Model, Attributes, HasMany, Cast, HasOne } from '../../src/index'
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

    @HasMany(() => Media)
    medias!: Relation<Media[]>;

    @HasOne(() => Media)
    picture!: Relation<Media>;

    @Cast(() => Thumbnail)
    thumbnail!: Thumbnail

    @Cast(() => Thumbnail)
    thumbnails!: Thumbnail[]


    static scopes = {
        active: (query: Relation<User>) => query.where({ status: 'active' }),
    }
}