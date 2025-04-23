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

  static async all<T extends BaseModel<any>>(this: new (...args: any[]) => T): Promise<T[]> {
    const resource = (this as any).resource
    const list = await HttpClient.call(`${resource}`)
    return list.map((item: any) => new this(item))
  }

  static async find<T extends BaseModel<any>>(this: new (...args: any[]) => T, id: string | number): Promise<T> {
    const resource = (this as any).resource
    const data = await HttpClient.call(`${resource}/${id}`)
    return new this(data)
  }

  static async create<T extends BaseModel<any>>(this: new (...args: any[]) => T, data: Partial<T>): Promise<T> {
    const resource = (this as any).resource
    const created = await HttpClient.call(`${resource}`, {
      method: Methods.POST,
      body: data
    })
    return new this(created)
  }

  static async update<T extends BaseModel<any>>(this: new (...args: any[]) => T, id: string | number, data: Partial<T>): Promise<T> {
    const resource = (this as any).resource
    const updated = await HttpClient.call(`${resource}/${id}`, {
      method: Methods.PATCH,
      body: data
    })
    return new this(updated)
  }

  static async delete(this: any, id: string | number): Promise<void> {
    const resource = this.resource
    await HttpClient.call(`${resource}/${id}`, {
      method: Methods.DELETE
    })
  }

  static async firstOrCreate<T extends BaseModel<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    createData?: Partial<T>
  ): Promise<T> {
    const resource = (this as any).resource
    const query = new URLSearchParams(where as Record<string, string>).toString()
    const list = await HttpClient.call(`${resource}?${query}`)
    if (list.length) return new this(list[0])
    const created = await HttpClient.call(`${resource}`, {
      method: Methods.POST,
      body: createData ?? where
    })
    return new this(created)
  }

  static async updateOrCreate<T extends BaseModel<any>>(
    this: new (...args: any[]) => T,
    where: Partial<T>,
    updateData: Partial<T>
  ): Promise<T> {
    const resource = (this as any).resource
    const query = new URLSearchParams(where as Record<string, string>).toString()
    const list = await HttpClient.call(`${resource}?${query}`)
    if (list.length) {
      const updated = await HttpClient.call(`${resource}/${list[0].id}`, {
        method: Methods.PATCH,
        body: updateData
      })
      return new this(updated)
    }
    const created = await HttpClient.call(`${resource}`, {
      method: Methods.POST,
      body: { ...where, ...updateData }
    })
    return new this(created)
  }
}