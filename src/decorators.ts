import { RelationBuilder, Relations, type RelationType } from './RelationBuilder'
import type { Model } from './Model'

const makeRelation = (
    modelFactory: () => new (...args: any[]) => Model<any>,
    type: RelationType,
    resource?: string
) => {
    
    return function (target: any, key: string | symbol) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get(this: Model<any>) {
                return RelationBuilder.build<any>(
                    modelFactory,
                    this,
                    type,
                    undefined,
                    resource ?? String(key)
                );
            },
            enumerable: true,
            configurable: true,
        });
    }
}

type CastInput =
    | ((val?: any) => any)                       // fonction custom
    | (() => any)                               // constructeur simple
    | (() => [any]);                            // constructeur tableau

export const Cast = (caster: CastInput) => {
    return function (target: any, propertyKey: string) {
        const privateKey = Symbol(propertyKey);

        let transformer: (val: any) => any;

        // If it's an object factory
        if (typeof caster === 'function') {
            const sample = caster();

            if (Array.isArray(sample)) {
                const ItemType = sample[0];
                transformer = (val) =>
                    Array.isArray(val)
                        ? val.map((v) =>
                            v instanceof ItemType ? v : Object.assign(new ItemType(), v)
                        )
                        : [];
            } else if (typeof sample === 'object') {
                transformer = (val) =>
                    val instanceof sample.constructor ? val : Object.assign(new sample.constructor(), val);
            } else {
                transformer = caster as (val: any) => any;
            }
        } else {
            transformer = caster as (val: any) => any;
        }

        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateKey];
            },
            set(value: any) {
                this[privateKey] = transformer(value);
            },
            enumerable: true,
            configurable: true,
        });
    };
}

// Aliases
export const HasOne = (model: () => Model<any>, resource?: string) => {
    return makeRelation(model as any, Relations.hasOne, resource)
}

export const HasMany = (model: () => Model<any>, resource?: string) => {
    return makeRelation(model as any, Relations.hasMany, resource)
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany