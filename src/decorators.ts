import { Builder, Relations, RelationType } from './Builder'
import type { BaseModel } from './BaseModel'

interface RelationConfig {
    type: RelationType
    resource?: string
}

export const Relation = (
    relatedModelFactory: () => new (...args: any[]) => BaseModel<any>,
    config: RelationConfig
) => {
    return function (target: any, key: string | symbol) {
        Object.defineProperty(target, key, {
            get(this: BaseModel<any>) {
                return () => Builder.build<any>(
                    this,
                    relatedModelFactory,
                    config.type,
                    config.resource
                )
            },
            enumerable: true,
            configurable: true,     
        })
    }
}

// Aliases
export const HasOne = (model: () => BaseModel<any>, resource?: string) => {
    return Relation(model as any, { type: Relations.hasOne, resource })
}

export const HasMany = (model: () => BaseModel<any>, resource?: string) => {
    return Relation(model as any, { type: Relations.hasMany, resource })
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany