import { BelongsTo, HasMany } from '../../src/decorators'
import { User } from './User'
import { Attributes, BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'
import { Thumbnail } from './Thumbnail'

export interface IMedia extends Attributes {
    id: string
    name: string
    size: string
    extension: string
    mime_type: string
    url: string
}

export class Media extends BaseModel<IMedia> {
    static resource = 'medias'

    @BelongsTo(() => User as any)
    declare user: Relation<User>

    @HasMany(() => Thumbnail as any)
    declare thumbnails: Relation<Thumbnail[]>
}