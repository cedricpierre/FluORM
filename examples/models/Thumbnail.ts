import { BelongsTo } from '../../src/decorators'
import { BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'
import { Media } from './Media'

export class Thumbnail extends BaseModel<any> {
    static resource = 'thumbnails'

    @BelongsTo(() => Media as any)
    declare media: Relation<Media>
}