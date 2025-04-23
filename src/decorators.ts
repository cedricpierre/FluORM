import { Builder, Relations, RelationType } from './Builder'
import type { BaseModel } from './BaseModel'

export const makeRelation = (
    modelFactory: () => new (...args: any[]) => BaseModel<any>,
    type: RelationType
) => {
    // Create a WeakMap to store instance-specific data
    const store = new WeakMap<any, any>();
    
    return function (target: any, key: string | symbol) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get(this: BaseModel<any>) {
                // Check if we already have a builder for this instance
                if (!store.has(this)) {
                    // Create and store the builder for this instance
                    const builder = Builder.build<any>(
                        modelFactory,
                        this,
                        key,
                        type,
                    );
                    store.set(this, builder);
                }
                // Return the stored builder
                return store.get(this);
            },
            set(value: any) {
                // Allow setting the value (needed for initialization)
                store.set(this, value);
            },
            enumerable: true,
            configurable: true,
        });
    }
}

// Aliases
export const HasOne = (model: () => BaseModel<any>) => {
    return makeRelation(model as any, Relations.hasOne)
}

export const HasMany = (model: () => BaseModel<any>) => {
    return makeRelation(model as any, Relations.hasMany)
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany