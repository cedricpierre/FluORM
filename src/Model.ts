import { RelationBuilder, type Relation } from './RelationBuilder'
import { HttpClient, Methods } from './HttpClient'
import { HasOneRelationBuilder } from './HasOneRelationBuilder'
import { HasManyRelationBuilder } from './HasManyRelationBuilder'
import { Constructor } from './decorators'
export interface Attributes extends Record<string, any> {
  id?: string | number
}

export class Model<A extends Attributes> {
  static scopes?: Record<string, (query: RelationBuilder<any>) => RelationBuilder<any>>
  #path: string

  id?: string | number
  [key: string]: any  

  static resource: string
  private static _queryCache = new WeakMap<Constructor<Model<any>>, any>()

  constructor(data?: Partial<A>) {
    if (data) {
      Object.assign(this, data)
    }

    this.#path = (this.constructor as any).resource

    if (this.id) {
      this.path += `/${this.id}`
    }

    return this
  }

  get path(): string {
    return this.#path
  }

  set path(path: string) {
    this.#path = path
  }

  private static getRelationBuilder<T extends Model<any>>(
    modelClass: Constructor<T>,
    relationBuilderFactory: Constructor<RelationBuilder<any>>
  ): Relation<T> {
    if (!Model._queryCache.has(modelClass)) {
      Model._queryCache.set(modelClass, new relationBuilderFactory(() => modelClass as any))
    }
    return Model._queryCache.get(modelClass)
  }

  static id<T extends Model<any>>(id: string | number): Relation<T> {
    return new this({ id })
  }

  static query<T extends Model<any>>(this: new (...args: any[]) => T): Relation<T> {
    return Model.getRelationBuilder(this, RelationBuilder)
  }

  static where<T extends Model<any>>(where: Partial<T>): Relation<T> {
    return Model.getRelationBuilder(this, RelationBuilder).where(where)
  }

  static filter<T extends Model<any>>(filters: Record<string, any>): Relation<T> {
    return Model.getRelationBuilder(this, RelationBuilder).filter(filters)
  }

  static include<T extends Model<any>>(relations: string | string[]): Relation<T> {
    return Model.getRelationBuilder(this, RelationBuilder).include(relations)
  }

  static async all<T extends Model<any>>(this: new (...args: any[]) => T): Promise<T[]> {
    return Model.getRelationBuilder(this, HasManyRelationBuilder).all()
  }

  static async find<T extends Model<any>>(id: string | number): Promise<T> {
    if (!id) throw new Error('ID is required for find operation')
    return Model.getRelationBuilder(this, HasOneRelationBuilder).find(id)
  }

  static async create<T extends Model<any>>(data: Partial<T>): Promise<T> {
    if (!data) throw new Error('Data is required for create operation')
    return Model.getRelationBuilder(this, HasManyRelationBuilder).create(data)
  }

  static async update<T extends Model<any>>(id: string | number, data: Partial<T>): Promise<T> {
    if (!id) throw new Error('ID is required for update operation')
    if (!data) throw new Error('Data is required for update operation')
    return Model.getRelationBuilder(this, HasManyRelationBuilder).update(id, data)
  }

  static async delete(id: string | number): Promise<void> {
    if (!id) throw new Error('ID is required for delete operation')
    return Model.getRelationBuilder(this, HasManyRelationBuilder).delete(id)
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
      Object.assign(this, data.data)
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

  toObject(): Record<string, any> {
    const obj: Record<string, any> = {}

    Object.keys(this).forEach(key => {
      obj[key] = this[key as keyof this]
    })

    const descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this))
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor.get) {
        const value = this[key as keyof this] as any
        if (value instanceof Model) {
          obj[key] = value.toObject()
        } else if (Array.isArray(value) && value.length > 0) {
          obj[key] = value.filter((item: any) => item instanceof Model).map((item: Model<any>) => item.toObject())
        }
      }
    }
    return obj
  }
}