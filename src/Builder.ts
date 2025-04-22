import { BaseModel } from "./BaseModel"
import { HttpClient, Methods } from "./HttpClient"
import { RelationQuery } from "./RelationQuery"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export const Relations = {
    hasOne: 'hasOne',
    hasMany: 'hasMany',
    belongsTo: 'belongsTo',
    belongsToMany: 'belongsToMany',
} as const;

export type RelationType = keyof typeof Relations;


export class Builder {
    static build<T>(
        parent: BaseModel,
        relatedModelFactory: () => new (...args: any[]) => BaseModel,
        relationType: RelationType,
        resourceOverride?: string
    ): Relation<T> {
        const RelatedModel = relatedModelFactory()
        const resource =
            resourceOverride ??
            (RelatedModel as any).resource ??
            RelatedModel.name.toLowerCase() + (relationType  === Relations.hasMany ? 's' : '')

        if (!parent.id) throw new Error('Missing parent ID')

        const basePath = `${HttpClient.options.baseUrl}/${parent.id}/${resource}`
        const query = new RelationQuery()

        const builder: any = {
            where: (key: string, value: any) => { query.where(key, value); return builder },
            filter: (filters: Record<string, any>) => { query.filter(filters); return builder },
            include: (relations: string | string[]) => { query.include(relations); return builder },
            orderBy: (field: string, dir: 'asc' | 'desc' = 'asc') => { query.orderBy(field, dir); return builder },
            limit: (n: number) => { query.limit(n); return builder },
            offset: (n: number) => { query.offset(n); return builder },
        }

        // 💡 Injection des scopes dynamiques
        for (const [name, fn] of Object.entries((RelatedModel as any).scopes ?? {})) {
            if (typeof fn === 'function') {
                builder[name] = (...args: any[]) => {
                    query.filter(fn(...args))
                    return builder
                }
            }
        }

        const buildUrl = (suffix = '') =>
            new URLBuilder(basePath + suffix).query(query.toObject()).toString()

        if (relationType === Relations.hasOne) {
            return {
                ...builder,
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
                firstOrCreate: async (where: any, createData?: any) => {
                    const found = await HttpClient.call(buildUrl() + '&' + new URLSearchParams(where).toString())
                    if (found?.length) return new RelatedModel(found[0])
                    const created = await HttpClient.call(basePath, {
                        method: Methods.POST,
                        body: createData ?? where
                    })
                    return new RelatedModel(created)
                },
                updateOrCreate: async (where: any, updateData: any) => {
                    const found = await HttpClient.call(buildUrl() + '&' + new URLSearchParams(where).toString())
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
            ...builder,
            all: async () => {
                const list = await HttpClient.call(buildUrl())
                return list.map((i: any) => new RelatedModel(i))
            },
            first: async () => {
                const list = await HttpClient.call(buildUrl('?limit=1'))
                return list[0] ? new RelatedModel(list[0]) : undefined
            },
            find: async (id: string) => {
                const item = await HttpClient.call(buildUrl('/' + id))
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
                const list = await HttpClient.call(buildUrl() + `&page=${page}&per_page=${perPage}`)
                return list.map((i: any) => new RelatedModel(i))
            },
            firstOrCreate: async (where: any, createData?: any) => {
                const list = await HttpClient.call(buildUrl() + '&' + new URLSearchParams(where).toString())
                const existing = list[0]
                if (existing) return new RelatedModel(existing)
                const created = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: createData ?? where
                })
                return new RelatedModel(created)
            },
            updateOrCreate: async (where: any, updateData: any) => {
                const list = await HttpClient.call(buildUrl() + '&' + new URLSearchParams(where).toString())
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