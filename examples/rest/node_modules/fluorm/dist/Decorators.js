import { Builder } from './Builder';
import { Relations } from './Relations';
const makeRelation = (modelFactory, type) => {
    return function (target, key) {
        // Initialize the property on the prototype
        Object.defineProperty(target, key, {
            get() {
                return Builder.build(modelFactory, this, key, type);
            },
            enumerable: true,
            configurable: true,
        });
    };
};
export const Cast = (caster) => {
    return function (target, propertyKey) {
        const privateKey = Symbol(propertyKey);
        let transformer;
        // If it's an object factory
        if (typeof caster === 'function') {
            const sample = caster();
            if (Array.isArray(sample)) {
                const ItemType = sample[0];
                transformer = (val) => Array.isArray(val)
                    ? val.map((v) => v instanceof ItemType ? v : Object.assign(new ItemType(), v))
                    : [];
            }
            else if (typeof sample === 'object') {
                transformer = (val) => val instanceof sample.constructor ? val : Object.assign(new sample.constructor(), val);
            }
            else {
                transformer = caster;
            }
        }
        else {
            transformer = caster;
        }
        Object.defineProperty(target, propertyKey, {
            get() {
                return this[privateKey];
            },
            set(value) {
                this[privateKey] = transformer(value);
            },
            enumerable: true,
            configurable: true,
        });
    };
};
// Aliases
export const HasOne = (model) => {
    return makeRelation(model, Relations.hasOne);
};
export const HasMany = (model) => {
    return makeRelation(model, Relations.hasMany);
};
export const BelongsTo = HasOne;
export const BelongsToMany = HasMany;
