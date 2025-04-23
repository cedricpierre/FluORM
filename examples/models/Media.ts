import { BelongsTo, HasMany } from '../../src/decorators'
import { User } from './User'
import { BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'
import { Thumbnail } from './Thumbnail'

export class Media extends BaseModel<any> {
    static resource = 'medias'

    @BelongsTo(() => User as any)
    declare user: Relation<User>

    @HasMany(() => Thumbnail as any)
    declare thumbnails: Relation<Thumbnail[]>
}