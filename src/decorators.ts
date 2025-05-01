import { RelationBuilder } from './RelationBuilder'
import { Model } from './Model'
import { HasManyRelationBuilder } from './HasManyRelationBuilder';
import { HasOneRelationBuilder } from './HasOneRelationBuilder';

export type Constructor<T = any> = new (...args: any[]) => T;

const makeRelation = (
    modelFactory: () => Model<any>,
    relationBuilderFactory: Constructor<RelationBuilder<any>>,
    resource?: string
) => {
    return function (target: any, key: string | symbol) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get(this: Model<any>) {
                const path = (this.path ? `${this.path}/` : '') + (resource ?? String(key))

                return new relationBuilderFactory(
                    modelFactory,
                    undefined,
                    path
                );
            },
            enumerable: true,
            configurable: true,
        });
    }
}

export const Cast = (caster: () => Constructor<any>) => {
    return (target: any, key: string) => {
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
export const HasOne = (model: () => Constructor<Model<any>>, resource?: string) => {
    return (target: any, propertyKey: string | symbol) => {
        return makeRelation(model as any, HasOneRelationBuilder as any, resource)(target, propertyKey);
    }
}

export const HasMany = (model: () => Constructor<Model<any>>, resource?: string) => {
    return (target: any, propertyKey: string | symbol) => {
        return makeRelation(model as any, HasManyRelationBuilder as any, resource)(target, propertyKey);
    }
}

export const BelongsTo = HasOne
export const BelongsToMany = HasMany