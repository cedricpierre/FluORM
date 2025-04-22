import { BelongsTo } from '../../src/decorators'
import { User } from './User'
import { BaseModel } from '../../src/BaseModel'
import { Relation } from '../../src/Builder'

export class Media extends BaseModel {
    static resource = 'medias'

    @BelongsTo(() => User)
    user!: () => Relation<User>

    // Scopes dynamiques (optionnels)
    static scopes = {
        active: () => ({ active: true }),
        latest: () => ({ sort: '-created_at' }),
    }
}