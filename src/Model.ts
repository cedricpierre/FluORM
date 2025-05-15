import { RelationBuilder, type Relation } from './RelationBuilder'
import { HttpClient, Methods } from './HttpClient'
import { HasOneRelationBuilder } from './HasOneRelationBuilder'
import { HasManyRelationBuilder } from './HasManyRelationBuilder'
import { Constructor } from './decorators'

export interface Attributes extends Record<string, any> {
  id?: string | number
}

export class Model<T extends Partial<Attributes>> {
  static scopes?: Record<string, (query: RelationBuilder<any>) => RelationBuilder<any>>
  #path: string

  id?: string | number
  [key: string]: any

  static resource: string
  private static _queryCache = new WeakMap<Constructor<Model<any>>, any>()

  constructor(data?: T) {
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

  private static getRelationBuilder<T extends Model<any>, R extends RelationBuilder<T>>(
    modelClass: Constructor<Model<any>>,
    relationBuilderFactory: Constructor<R>
  ): R {
    if (!Model._queryCache.has(modelClass)) {
      Model._queryCache.set(modelClass, new relationBuilderFactory(() => modelClass as any))
    }
    return Model._queryCache.get(modelClass) as R
  }

  static id<T extends Model<any>>(this: Constructor<T>, id: string | number): T {
    return new this({ id })
  }

  static query<T extends Model<Attributes>>(this: Constructor<T>): RelationBuilder<T> {
    return Model.getRelationBuilder<T, RelationBuilder<T>>(this, RelationBuilder)
  }

  static where<T extends Model<Attributes>>(this: Constructor<T>, where: Partial<Attributes>): RelationBuilder<T> {
    return Model.getRelationBuilder<T, RelationBuilder<T>>(this, RelationBuilder).where(where)
  }

  static filter<T extends Model<Attributes>>(this: Constructor<T>, filters: Record<string, any>): RelationBuilder<T> {
    return Model.getRelationBuilder<T, RelationBuilder<T>>(this, RelationBuilder).filter(filters)
  }

  static include<T extends Model<Attributes>>(this: Constructor<T>, relations: string | string[]): RelationBuilder<T> {
    return Model.getRelationBuilder<T, RelationBuilder<T>>(this, RelationBuilder).include(relations)
  }

  static async all<T extends Model<Attributes>>(this: Constructor<T>): Promise<T[]> {
    return (await Model.getRelationBuilder<T, HasManyRelationBuilder<T>>(this, HasManyRelationBuilder).all()) as T[]
  }

  static async find<T extends Model<Attributes>>(this: Constructor<T>, id: string | number): Promise<T> {
    return (await Model.getRelationBuilder<T, HasOneRelationBuilder<T>>(this, HasOneRelationBuilder).find(id)) as T
  }

  static async create<T extends Model<Attributes>>(this: Constructor<T>, data: Partial<Attributes>): Promise<T> {
    return (await Model.getRelationBuilder<T, HasManyRelationBuilder<T>>(this, HasManyRelationBuilder).create(data)) as T
  }

  static async update<T extends Model<Attributes>>(this: Constructor<T>, id: string | number, data: Partial<Attributes>): Promise<T> {
    return (await Model.getRelationBuilder<T, HasManyRelationBuilder<T>>(this, HasManyRelationBuilder).update(id, data)) as T
  }

  static async delete<T extends Model<Attributes>>(this: Constructor<T>, id: string | number): Promise<void> {
    return Model.getRelationBuilder(this, HasManyRelationBuilder).delete(id)
  }

  async get(): Promise<this> {
    const resource = (this.constructor as any).resource

    const data = await HttpClient.call(`${resource}/${this.id}`, {
      method: Methods.GET,
    })

    Object.assign(this, data)

    return this
  }

  async save(): Promise<this> {

    if (this.id) {
      return this.update()
    }

    const resource = (this.constructor as any).resource

    const data = await HttpClient.call(resource, {
      method: Methods.POST,
      body: { ...this }
    })
    Object.assign(this, data)
    return this
  }

  async update(data?: Partial<T>): Promise<this> {
    const resource = (this.constructor as any).resource


    if (data) Object.assign(this, data)
    const updated = await HttpClient.call(`${resource}/${this.id}`, {
      method: Methods.PATCH,
      body: { ...this }
    })
    Object.assign(this, updated)
    return this
  }


  async delete(): Promise<void> {
    const resource = (this.constructor as any).resource

    await HttpClient.call(`${resource}/${this.id}`, {
      method: Methods.DELETE
    })
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