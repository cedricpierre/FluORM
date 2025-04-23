import { BaseModel } from "./BaseModel"
import { HttpClient, Methods } from "./HttpClient"
import { URLQueryBuilder } from "./URLQueryBuilder"
import { URLBuilder } from "./URLBuilder"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export const Relations = {
    hasOne: 'hasOne',
    hasMany: 'hasMany',
    belongsTo: 'belongsTo',
    belongsToMany: 'belongsToMany',
} as const;

export type RelationType = keyof typeof Relations;

export interface IBuilder<T extends BaseModel<any>> {
    where(where: Record<string, any>): IBuilder<T>;
    filter(filters: Record<string, any>): IBuilder<T>;
    include(relations: string | string[]): IBuilder<T>;
    orderBy(field: string, dir?: string): IBuilder<T>;
    limit(n: number): IBuilder<T>;
    offset(n: number): IBuilder<T>;
    all(): Promise<T[]>;
    first(): Promise<T | undefined>;
    find(id: string | number): Promise<T>;
    create(payload: any): Promise<T>;
    update(id: string | number, payload: any): Promise<T>;
    delete(id: string | number): Promise<void>;
    paginate(page?: number, perPage?: number): Promise<T[]>;
    firstOrCreate(where: Record<string, any>, createData?: any): Promise<T>;
    updateOrCreate(where: Record<string, any>, updateData: any): Promise<T>;
}

export class Builder {
    static build<T extends BaseModel<any>>(
        modelFactory: () => new (...args: any[]) => T,
        parent?: BaseModel<any>,
        key?: string | symbol,
        relationType?: RelationType,
    ): IBuilder<T> {

        const RelatedModel = modelFactory()

        let basePath = `${HttpClient.options.baseUrl}/${(RelatedModel as any).resource}`
        
        if(parent?.id) {
            basePath += `/${parent.id}`
        }

        if(key) {
            basePath += `/${String(key)}`
        }

        const query = new URLQueryBuilder()

        const queryBuilder: any = {
            where: (where: Record<string, any>) => { query.where(where); return RelatedModel },
            filter: (filters: Record<string, any>) => { query.filter(filters); return RelatedModel },
            include: (relations: string | string[]) => { query.include(relations); return RelatedModel },
            orderBy: (field: string, dir: string = 'asc') => { query.orderBy(field, dir); return RelatedModel },
            limit: (n: number) => { query.limit(n); return RelatedModel },
            offset: (n: number) => { query.offset(n); return RelatedModel },
        }

        // 💡 Injection des scopes dynamiques
        for (const [name, fn] of Object.entries((RelatedModel as any).scopes ?? {})) {
            if (typeof fn === 'function') {
                queryBuilder[name] = (...args: any[]) => {
                    query.filter(fn(...args))
                    return this
                }
            }
        }

        const buildUrl = (queryParams: Record<string, any> = {}) => {
            return new URLBuilder(basePath).query({ ...query.toObject(), ...queryParams }).toString()
        }

        if (relationType === Relations.hasOne) {
            return {
                ...queryBuilder,
                first: async () => {
                    const data = await HttpClient.call(buildUrl())
                    return new RelatedModel(data)
                },
                update: async (data: any) => {
                    const existing = await HttpClient.call(buildUrl())
                    const updated = await HttpClient.call(`${basePath}/${existing.id}`, {
                        method: Methods.PATCH,
                        body: data
                    })
                    return new RelatedModel(updated)
                },
                delete: async () => {
                    const existing = await HttpClient.call(buildUrl())
                    return await HttpClient.call(`${basePath}/${existing.id}`, { method: Methods.DELETE })
                },
                firstOrCreate: async (where: Record<string, any>, createData?: any) => {
                    query.where(where)
                    const found = await HttpClient.call(buildUrl())
                    if (found?.length) return new RelatedModel(found[0])
                    const created = await HttpClient.call(basePath, {
                        method: Methods.POST,
                        body: createData ?? where
                    })
                    return new RelatedModel(created)
                },
                updateOrCreate: async (where: Record<string, any>, updateData: any) => {
                    query.where(where)
                    const found = await HttpClient.call(buildUrl())
                    if (found?.length) {
                        return await HttpClient.call(`${basePath}/${found[0].id}`, {
                            method: Methods.PATCH,
                            body: updateData
                        })
                    }
                    const created = await HttpClient.call(basePath, {
                        method: Methods.POST,
                        body: { ...where, ...updateData }
                    })
                    return new RelatedModel(created)
                }
            } as IBuilder<T>
        }

        return {
            ...queryBuilder,
            all: async () => {
                const list = await HttpClient.call(buildUrl())
                return list.map((i: any) => new RelatedModel(i))
            },
            first: async () => {
                query.limit(1)
                const list = await HttpClient.call(buildUrl())
                return list[0] ? new RelatedModel(list[0]) : undefined
            },
            find: async (id: string) => {
                const item = await HttpClient.call(`${basePath}/${id}`)
                return new RelatedModel(item)
            },
            create: async (payload: any) => {
                const data = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: payload
                })
                return new RelatedModel(data)
            },
            update: async (id: string, payload: any) => {
                const data = await HttpClient.call(`${basePath}/${id}`, {
                    method: Methods.PATCH,
                    body: payload
                })
                return new RelatedModel(data)
            },
            delete: async (id: string) => {
                await HttpClient.call(`${basePath}/${id}`, { method: Methods.DELETE })
            },
            paginate: async (page = 1, perPage = 10) => {
                query.offset((page - 1) * perPage).limit(perPage)

                const list = await HttpClient.call(buildUrl())
                return list.map((i: any) => new RelatedModel(i))
            },
            firstOrCreate: async (where: Record<string, any>, createData?: any) => {
                query.where(where)
                const list = await HttpClient.call(buildUrl())
                const existing = list[0]
                if (existing) return new RelatedModel(existing)
                const created = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: createData ?? where
                })
                return new RelatedModel(created)
            },
            updateOrCreate: async (where: Record<string, any>, updateData: any) => {
                query.where(where)
                const list = await HttpClient.call(buildUrl())
                const existing = list[0]
                if (existing) {
                    const updated = await HttpClient.call(`${basePath}/${existing.id}`, {
                        method: Methods.PATCH,
                        body: updateData
                    })
                    return new RelatedModel(updated)
                }
                const created = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: { ...where, ...updateData }
                })
                return new RelatedModel(created)
            }
        } as IBuilder<T>
    }
}