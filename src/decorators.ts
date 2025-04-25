import { Builder } from './Builder'
import type { Model } from './Model'
import { Relations, type RelationType } from './Relations';

const makeRelation = (
    modelFactory: () => new (...args: any[]) => Model<any>,
    type: RelationType
) => {
    
    return function (target: any, key: string | symbol) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get(this: Model<any>) {
                return Builder.build<any>(
                    modelFactory,
                    this,
                    key,
                    type,
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
export const HasOne = (model: () => Model<any>) => {
    return makeRelation(model as any, Relations.hasOne)
}

export const HasMany = (model: () => Model<any>) => {
    return makeRelation(model as any, Relations.hasMany)
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany