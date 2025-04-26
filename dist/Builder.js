import { HttpClient, Methods } from "./HttpClient";
import { URLQueryBuilder } from "./URLQueryBuilder";
import { Relations } from "./Relations";
export class Builder {
    static build(modelFactory, parent, key, relationType, urlQueryBuilder) {
        const query = urlQueryBuilder ?? new URLQueryBuilder();
        const RelatedModel = modelFactory();
        let basePath = RelatedModel.resource;
        if (parent?.id) {
            basePath += `/${parent.id}`;
        }
        if (key) {
            basePath += `/${String(key)}`;
        }
        const queryBuilder = {
            where: (where) => { query.where(where); return this.build(modelFactory, parent, key, relationType, query); },
            filter: (filters) => { query.filter(filters); return this.build(modelFactory, parent, key, relationType, query); },
            include: (relations) => { query.include(relations); return this.build(modelFactory, parent, key, relationType, query); },
            orderBy: (field, dir = 'asc') => { query.orderBy(field, dir); return this.build(modelFactory, parent, key, relationType, query); },
            limit: (n) => { query.limit(n); return this.build(modelFactory, parent, key, relationType, query); },
            offset: (n) => { query.offset(n); return this.build(modelFactory, parent, key, relationType, query); },
        };
        // 💡 Injection des scopes dynamiques
        for (const [name, fn] of Object.entries(RelatedModel.scopes ?? {})) {
            if (typeof fn === 'function') {
                queryBuilder[name] = (...args) => {
                    query.filter(fn(...args));
                    return this.build(modelFactory, parent, key, relationType, query);
                };
            }
        }
        const buildUrl = () => {
            const url = query ? `${basePath}?${new URLSearchParams(query.toObject()).toString()}` : basePath;
            return decodeURIComponent(`${HttpClient.options.baseUrl}/${url}`);
        };
        if (relationType === Relations.hasOne) {
            return {
                ...queryBuilder,
                first: async () => {
                    const data = await HttpClient.call(buildUrl());
                    return new RelatedModel(data);
                },
                update: async (data) => {
                    const existing = await HttpClient.call(buildUrl());
                    const updated = await HttpClient.call(`${basePath}/${existing.id}`, {
                        method: Methods.PATCH,
                        body: data
                    });
                    return new RelatedModel(updated);
                },
                delete: async () => {
                    const existing = await HttpClient.call(buildUrl());
                    return await HttpClient.call(`${basePath}/${existing.id}`, { method: Methods.DELETE });
                },
                firstOrCreate: async (where, createData) => {
                    query.where(where);
                    const found = await HttpClient.call(buildUrl());
                    if (found?.length)
                        return new RelatedModel(found[0]);
                    const created = await HttpClient.call(basePath, {
                        method: Methods.POST,
                        body: createData ?? where
                    });
                    return new RelatedModel(created);
                },
                updateOrCreate: async (where, updateData) => {
                    query.where(where);
                    const found = await HttpClient.call(buildUrl());
                    if (found?.length) {
                        return await HttpClient.call(`${basePath}/${found[0].id}`, {
                            method: Methods.PATCH,
                            body: updateData
                        });
                    }
                    const created = await HttpClient.call(basePath, {
                        method: Methods.POST,
                        body: { ...where, ...updateData }
                    });
                    return new RelatedModel(created);
                }
            };
        }
        return {
            ...queryBuilder,
            all: async () => {
                const list = await HttpClient.call(buildUrl());
                return list.map((i) => new RelatedModel(i));
            },
            first: async () => {
                query.limit(1);
                const list = await HttpClient.call(buildUrl());
                return list[0] ? new RelatedModel(list[0]) : undefined;
            },
            find: async (id) => {
                const item = await HttpClient.call(`${basePath}/${id}`);
                return new RelatedModel(item);
            },
            create: async (payload) => {
                const data = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: payload
                });
                return new RelatedModel(data);
            },
            update: async (id, payload) => {
                const data = await HttpClient.call(`${basePath}/${id}`, {
                    method: Methods.PATCH,
                    body: payload
                });
                return new RelatedModel(data);
            },
            delete: async (id) => {
                await HttpClient.call(`${basePath}/${id}`, { method: Methods.DELETE });
            },
            paginate: async (page = 1, perPage = 10) => {
                query.page(page)
                    .perPage(perPage)
                    .offset((page - 1) * perPage)
                    .limit(perPage);
                const list = await HttpClient.call(buildUrl());
                return list.map((i) => new RelatedModel(i));
            },
            firstOrCreate: async (where, createData) => {
                query.where(where);
                const list = await HttpClient.call(buildUrl());
                const existing = list[0];
                if (existing)
                    return new RelatedModel(existing);
                const created = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: createData ?? where
                });
                return new RelatedModel(created);
            },
            updateOrCreate: async (where, updateData) => {
                query.where(where);
                const list = await HttpClient.call(buildUrl());
                const existing = list[0];
                if (existing) {
                    const updated = await HttpClient.call(`${basePath}/${existing.id}`, {
                        method: Methods.PATCH,
                        body: updateData
                    });
                    return new RelatedModel(updated);
                }
                const created = await HttpClient.call(basePath, {
                    method: Methods.POST,
                    body: { ...where, ...updateData }
                });
                return new RelatedModel(created);
            }
        };
    }
}
