import { Model, HasMany} from '../../src/index'
import { Relation } from '../../src/RelationBuilder'

import { Comment } from './Comment'

export class Post extends Model<any> {
    static resource = 'posts'

    @HasMany(() => Comment)
    comments!: Relation<Comment[]>;
}