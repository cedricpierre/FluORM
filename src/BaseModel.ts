import { Builder, Relation } from './Builder'
import { HttpClient, Methods } from './HttpClient'

export interface Attributes extends Record<string, any> {
  id?: string | number
}

export abstract class BaseModel<A extends Attributes> {
  id?: string | number
  [key: string]: any

  static resource: string


  constructor(data?: Partial<A>) {
    if (data) {
      Object.assign(this, data)
    }

    return this
  }

  static where<T extends BaseModel<any>>(this: new (...args: any[]) => T, where: Partial<T>): Relation<T> {
    return Builder.build(() => this).where(where)
  }

  static filter<T extends BaseModel<any>>(this: new (...args: any[]) => T, filters: Record<string, any>): Relation<T> {
    return Builder.build(() => this).filter(filters)
  }

  static include<T extends BaseModel<any>>(this: new (...args: any[]) => T, relations: string | string[]): Relation<T> {
    return Builder.build(() => this).include(relations)
  }

  static async all<T extends BaseModel<any>>(this: new (...args: any[]) => T): Promise<T[]> {
    return Builder.build(() => this).all()
  }

  static async find<T extends BaseModel<any>>(this: new (...args: any[]) => T, id: string | number): Promise<T> {
    return Builder.build(() => this).find(id)
  }

  static async create<T extends BaseModel<any>>(this: new (...args: any[]) => T, data: Partial<T>): Promise<T> {
    return Builder.build(() => this).create(data)
  }

  static async update<T extends BaseModel<any>>(this: new (...args: any[]) => T, id: string | number, data: Partial<T>): Promise<T> {
    return Builder.build(() => this).update(id, data)
  }

  static async delete(this: any, id: string | number): Promise<void> {
    return Builder.build(() => this).delete(id)
  }

  static async firstOrCreate<T extends BaseModel<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    createData?: Partial<T>
  ): Promise<T> {
    return Builder.build(() => this).firstOrCreate(where, createData)
  }

  static async updateOrCreate<T extends BaseModel<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    updateData: Partial<T>
  ): Promise<T> {
    return Builder.build(() => this).updateOrCreate(where, updateData)
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

  async update(data?: Partial<this>): Promise<this> {
    if (!this.id) throw new Error('Cannot update a model without an ID')
    const resource = (this.constructor as any).resource
    if (data) Object.assign(this.attributes, data)
    const updated = await HttpClient.call(`${resource}/${this.id}`, {
      method: Methods.PATCH,
      body: { ...this }
    })
    Object.assign(this, updated)
    return this
  }

  async delete(): Promise<void> {
    if (!this.id) throw new Error('Cannot delete a model without an ID')
    const resource = (this.constructor as any).resource
    await HttpClient.call(`${resource}/${this.id}`, {
      method: Methods.DELETE
    })
  }
}