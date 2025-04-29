import { RelationBuilder, Relations, type RelationType } from './RelationBuilder'
import { Model } from './Model'

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

export const Cast = (caster: () => new (...args: any[]) => any) => {
    return function (target: any, key: string) {
        // Create a unique symbol for each instance
        const privateKey = Symbol(key);

        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get(this: any) {
                if (!this[privateKey]) {
                    this[privateKey] = undefined;
                }
                const value = this[privateKey];
                if (!value) return value;
                
                const ModelClass = caster();
                if (!ModelClass) return value;

                if (Array.isArray(value)) {
                    return value.map(item => item instanceof ModelClass ? item : new ModelClass(item));
                } else if (value instanceof ModelClass) {
                    return value;
                } else {
                    return new ModelClass(value);
                }
            },
            set(this: any, value: any) {
                const ModelClass = caster();
                if (!ModelClass) {
                    this[privateKey] = value;
                    return;
                }

                if (Array.isArray(value)) {
                    this[privateKey] = value.map(item => item instanceof ModelClass ? item : new ModelClass(item));
                } else if (value instanceof ModelClass) {
                    this[privateKey] = value;
                } else {
                    this[privateKey] = new ModelClass(value);
                }
            },
            enumerable: true,
            configurable: true,
        });
    };
};

// Aliases
export const HasOne = (model: () => any, resource?: string) => {
    return function (target: any, propertyKey: string | symbol) {
        return makeRelation(model, Relations.hasOne, resource)(target, propertyKey);
    }
}

export const HasMany = (model: () => new (...args: any[]) => Model<any>, resource?: string) => {
    return function (target: any, propertyKey: string | symbol) {
        return makeRelation(model, Relations.hasMany, resource)(target, propertyKey);
    }
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany