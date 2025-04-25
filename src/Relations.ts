export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export const Relations = {
    hasOne: 'hasOne',
    hasMany: 'hasMany',
    belongsTo: 'belongsTo',
    belongsToMany: 'belongsToMany',
} as const;

export type RelationType = keyof typeof Relations;