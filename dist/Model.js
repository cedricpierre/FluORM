import { RelationBuilder } from './RelationBuilder';
import { HttpClient, Methods } from './HttpClient';
export class Model {
    id;
    static resource;
    static _queryCache = new Map();
    constructor(data) {
        if (data) {
            Object.assign(this, data);
        }
        return this;
    }
    static getRelationBuilder(modelClass) {
        const cacheKey = modelClass.name;
        if (!Model._queryCache.has(cacheKey)) {
            Model._queryCache.set(cacheKey, RelationBuilder.build(() => modelClass));
        }
        return Model._queryCache.get(cacheKey);
    }
    static id(id) {
        return Model.getRelationBuilder(this).id(id);
    }
    static query() {
        return Model.getRelationBuilder(this);
    }
    static where(where) {
        return Model.getRelationBuilder(this).where(where);
    }
    static filter(filters) {
        return Model.getRelationBuilder(this).filter(filters);
    }
    static include(relations) {
        return Model.getRelationBuilder(this).include(relations);
    }
    static async all() {
        return Model.getRelationBuilder(this).all();
    }
    static async find(id) {
        if (!id)
            throw new Error('ID is required for find operation');
        return Model.getRelationBuilder(this).find(id);
    }
    static async create(data) {
        if (!data)
            throw new Error('Data is required for create operation');
        return Model.getRelationBuilder(this).create(data);
    }
    static async update(id, data) {
        if (!id)
            throw new Error('ID is required for update operation');
        if (!data)
            throw new Error('Data is required for update operation');
        return Model.getRelationBuilder(this).update(id, data);
    }
    static async delete(id) {
        if (!id)
            throw new Error('ID is required for delete operation');
        return Model.getRelationBuilder(this).delete(id);
    }
    static async firstOrCreate(where, createData) {
        if (!where)
            throw new Error('Where conditions are required for firstOrCreate operation');
        return Model.getRelationBuilder(this).firstOrCreate(where, createData);
    }
    static async updateOrCreate(where, updateData) {
        if (!where)
            throw new Error('Where conditions are required for updateOrCreate operation');
        if (!updateData)
            throw new Error('Update data is required for updateOrCreate operation');
        return Model.getRelationBuilder(this).updateOrCreate(where, updateData);
    }
    async save() {
        try {
            if (this.id) {
                return this.update();
            }
            const resource = this.constructor.resource;
            if (!resource)
                throw new Error('Resource name is not defined');
            const data = await HttpClient.call(resource, {
                method: Methods.POST,
                body: { ...this }
            });
            Object.assign(this, data);
            return this;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to save model: ${error.message}`);
            }
            throw new Error('Failed to save model: Unknown error');
        }
    }
    async update(data) {
        try {
            if (!this.id)
                throw new Error('Cannot update a model without an ID');
            const resource = this.constructor.resource;
            if (!resource)
                throw new Error('Resource name is not defined');
            if (data)
                Object.assign(this, data);
            const updated = await HttpClient.call(`${resource}/${this.id}`, {
                method: Methods.PATCH,
                body: { ...this }
            });
            Object.assign(this, updated);
            return this;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update model: ${error.message}`);
            }
            throw new Error('Failed to update model: Unknown error');
        }
    }
    async delete() {
        try {
            if (!this.id)
                throw new Error('Cannot delete a model without an ID');
            const resource = this.constructor.resource;
            if (!resource)
                throw new Error('Resource name is not defined');
            await HttpClient.call(`${resource}/${this.id}`, {
                method: Methods.DELETE
            });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete model: ${error.message}`);
            }
            throw new Error('Failed to delete model: Unknown error');
        }
    }
}
