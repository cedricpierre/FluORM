import { Media } from './Media'
import { Relation, Model, BelongsTo } from '../../src/index'

export class Thumbnail extends Model<any> {
    static resource = 'thumbnails'

    @BelongsTo(() => Media as any)
    declare media: Relation<Media>
}