import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { URLQueryBuilder } from "./URLQueryBuilder"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export const Relations = {
    hasOne: 'hasOne',
    hasMany: 'hasMany',
    belongsTo: 'belongsTo',
    belongsToMany: 'belongsToMany',
} as const;

export type RelationType = keyof typeof Relations;

export class RelationBuilder {
    static build<T extends Model<any>>(
        modelFactory: () => Model<any>,
        parent?: Model<any>,
        relationType?: RelationType,
        urlQueryBuilder?: URLQueryBuilder,
        resource?: string
    ): Relation<T> {

        const query = urlQueryBuilder ?? new URLQueryBuilder()
        const RelatedModel = modelFactory() as Model<any> | any

        let basePath = resource ?? (parent as any)?.resource ?? (RelatedModel as any).resource
        
        if(parent) {
            basePath = `${parent.resource}/${basePath}`
        }

        const queryBuilder: any = {
            id: (id: string | number) => { 
                const item = new RelatedModel({id})
                item.resource = `${basePath}/${id}`
                return item
            },
            find: async (id: string) => {
                const item = await HttpClient.call(`${basePath}/${id}`)
                return new RelatedModel(item)
            },            
            where: (where: Record<string, any>) => { query.where(where); return this.build(modelFactory, parent, relationType, query, resource) },
            filter: (filters: Record<string, any>) => { query.filter(filters); return this.build(modelFactory, parent, relationType, query, resource) },
            include: (relations: string | string[]) => { query.include(relations); return this.build(modelFactory, parent, relationType, query, resource) },
            orderBy: (field: string, dir: string = 'asc') => { query.orderBy(field, dir); return this.build(modelFactory, parent, relationType, query, resource) },
            limit: (n: number) => { query.limit(n); return this.build(modelFactory, parent, relationType, query, resource) },
            offset: (n: number) => { query.offset(n); return this.build(modelFactory, parent, relationType, query, resource) },
        }

        // 💡 Injection des scopes dynamiques
        for (const [name, fn] of Object.entries((RelatedModel as any).scopes ?? {})) {
            if (typeof fn === 'function') {
                queryBuilder[name] = (...args: any[]) => {
                    query.filter(fn(...args))
                    return this.build(modelFactory, parent, relationType, query, resource)
                }
            }
        }

        const buildUrl = () => {
            const queryObject = query.toObject()
            const url = Object.keys(queryObject).length > 0 ? `${basePath}?${new URLSearchParams(queryObject).toString() }` : basePath
            query.reset()
            return decodeURIComponent(`${HttpClient.options.baseUrl}/${url}`)
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
            } as Relation<T>
        }

        return {
            ...queryBuilder,
            all: async () => {
                const list = await HttpClient.call(buildUrl())
                return list.map((i: any) => new RelatedModel(i))
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
                query.page(page)
                    .perPage(perPage)
                    .offset((page - 1) * perPage)
                    .limit(perPage)

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
        } as Relation<T>
    }
}
