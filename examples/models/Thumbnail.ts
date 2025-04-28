import { Media } from './Media'
import { Model, BelongsTo } from '../../src/index'
import { Relation } from '../../src/RelationBuilder'

export class Thumbnail extends Model<any> {
    static resource = 'thumbnails'
}