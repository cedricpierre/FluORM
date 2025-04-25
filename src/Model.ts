import { Builder } from './Builder'
import { HttpClient, Methods } from './HttpClient'
import { Relation } from './Relations'

export interface Attributes extends Record<string, any> {
  id?: string | number
}

export abstract class Model<A extends Attributes> {
  id?: string | number
  [key: string]: any

  static resource: string
  private static _queryCache = new Map<string, any>()

  constructor(data?: Partial<A>) {
    if (data) {
      Object.assign(this, data)
    }
    return this
  }

  private static getQueryBuilder<T extends Model<any>>(modelClass: new (...args: any[]) => T): Relation<T> {
    const cacheKey = modelClass.name
    if (!Model._queryCache.has(cacheKey)) {
      Model._queryCache.set(cacheKey, Builder.build(() => modelClass))
    }
    return Model._queryCache.get(cacheKey)
  }

  static query<T extends Model<any>>(this: new (...args: any[]) => T): Relation<T> {
    return Model.getQueryBuilder(this)
  }

  static where<T extends Model<any>>(this: new (...args: any[]) => T, where: Partial<T>): Relation<T> {
    return Model.getQueryBuilder(this).where(where)
  }

  static filter<T extends Model<any>>(this: new (...args: any[]) => T, filters: Record<string, any>): Relation<T> {
    return Model.getQueryBuilder(this).filter(filters)
  }

  static include<T extends Model<any>>(this: new (...args: any[]) => T, relations: string | string[]): Relation<T> {
    return Model.getQueryBuilder(this).include(relations)
  }

  static async all<T extends Model<any>>(this: new (...args: any[]) => T): Promise<T[]> {
    return Model.getQueryBuilder(this).all()
  }

  static async find<T extends Model<any>>(this: new (...args: any[]) => T, id: string | number): Promise<T> {
    if (!id) throw new Error('ID is required for find operation')
    return Model.getQueryBuilder(this).find(id)
  }

  static async create<T extends Model<any>>(this: new (...args: any[]) => T, data: Partial<T>): Promise<T> {
    if (!data) throw new Error('Data is required for create operation')
    return Model.getQueryBuilder(this).create(data)
  }

  static async update<T extends Model<any>>(this: new (...args: any[]) => T, id: string | number, data: Partial<T>): Promise<T> {
    if (!id) throw new Error('ID is required for update operation')
    if (!data) throw new Error('Data is required for update operation')
    return Model.getQueryBuilder(this).update(id, data)
  }

  static async delete(this: new (...args: any[]) => Model<any>, id: string | number): Promise<void> {
    if (!id) throw new Error('ID is required for delete operation')
    return Model.getQueryBuilder(this).delete(id)
  }

  static async firstOrCreate<T extends Model<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    createData?: Partial<T>
  ): Promise<T> {
    if (!where) throw new Error('Where conditions are required for firstOrCreate operation')
    return Model.getQueryBuilder(this).firstOrCreate(where, createData)
  }

  static async updateOrCreate<T extends Model<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    updateData: Partial<T>
  ): Promise<T> {
    if (!where) throw new Error('Where conditions are required for updateOrCreate operation')
    if (!updateData) throw new Error('Update data is required for updateOrCreate operation')
    return Model.getQueryBuilder(this).updateOrCreate(where, updateData)
  }

  async save(): Promise<this> {
    try {
      if (this.id) {
        return this.update()
      }
      const resource = (this.constructor as any).resource
      if (!resource) throw new Error('Resource name is not defined')
      
      const data = await HttpClient.call(resource, {
        method: Methods.POST,
        body: { ...this }
      })
      Object.assign(this, data)
      return this
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to save model: ${error.message}`)
      }
      throw new Error('Failed to save model: Unknown error')
    }
  }

  async update(data?: Partial<this>): Promise<this> {
    try {
      if (!this.id) throw new Error('Cannot update a model without an ID')
      const resource = (this.constructor as any).resource
      if (!resource) throw new Error('Resource name is not defined')
      
      if (data) Object.assign(this, data)
      const updated = await HttpClient.call(`${resource}/${this.id}`, {
        method: Methods.PATCH,
        body: { ...this }
      })
      Object.assign(this, updated)
      return this
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to update model: ${error.message}`)
      }
      throw new Error('Failed to update model: Unknown error')
    }
  }

  async delete(): Promise<void> {
    try {
      if (!this.id) throw new Error('Cannot delete a model without an ID')
      const resource = (this.constructor as any).resource
      if (!resource) throw new Error('Resource name is not defined')
      
      await HttpClient.call(`${resource}/${this.id}`, {
        method: Methods.DELETE
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete model: ${error.message}`)
      }
      throw new Error('Failed to delete model: Unknown error')
    }
  }
}