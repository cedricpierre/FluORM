import { Model, Attributes, HasMany, Cast, HasOne } from '../../src/index'
import { Relation } from '../../src/RelationBuilder'
import { Company } from './Company'

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

    @HasMany(() => Media, 'medias')
    libraries!: Relation<Media[]>;

    @HasOne(() => Media)
    picture!: Relation<Media>;

    @Cast(() => Thumbnail)
    thumbnail!: Thumbnail

    @Cast(() => Thumbnail)
    thumbnails!: Thumbnail[]

    @Cast(() => Company)
    company!: Company

    static scopes = {
        active: (query: Relation<User>) => query.where({ status: 'active' }),
    }
}