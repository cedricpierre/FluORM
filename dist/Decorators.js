import { RelationBuilder, Relations } from './RelationBuilder';
const makeRelation = (modelFactory, type, resource) => {
    return function (target, key) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get() {
                return RelationBuilder.build(modelFactory, this, type, undefined, resource ?? String(key));
            },
            enumerable: true,
            configurable: true,
        });
    };
};
export const Cast = (caster) => {
    return function (target, key) {
        // Create a unique symbol for each instance
        const privateKey = Symbol(key);
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get() {
                if (!this[privateKey]) {
                    this[privateKey] = undefined;
                }
                const value = this[privateKey];
                if (!value)
                    return value;
                const ModelClass = caster();
                if (!ModelClass)
                    return value;
                if (Array.isArray(value)) {
                    return value.map(item => item instanceof ModelClass ? item : new ModelClass(item));
                }
                else if (value instanceof ModelClass) {
                    return value;
                }
                else {
                    return new ModelClass(value);
                }
            },
            set(value) {
                const ModelClass = caster();
                if (!ModelClass) {
                    this[privateKey] = value;
                    return;
                }
                if (Array.isArray(value)) {
                    this[privateKey] = value.map(item => item instanceof ModelClass ? item : new ModelClass(item));
                }
                else if (value instanceof ModelClass) {
                    this[privateKey] = value;
                }
                else {
                    this[privateKey] = new ModelClass(value);
                }
            },
            enumerable: true,
            configurable: true,
        });
    };
};
// Aliases
export const HasOne = (model, resource) => {
    return makeRelation(model, Relations.hasOne, resource);
};
export const HasMany = (model, resource) => {
    return makeRelation(model, Relations.hasMany, resource);
};
export const BelongsTo = HasOne;
export const BelongsToMany = HasMany;
