import { Model } from "./Model"
import { HttpClient } from "./HttpClient"
import { URLQueryBuilder } from "./URLQueryBuilder"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export class RelationBuilder<T extends Model<any>> {
    protected queryBuilder: URLQueryBuilder
    protected relatedModel: T
    protected path: string = ''

    constructor(
        model: () => Model<any>,
        urlQueryBuilder?: URLQueryBuilder,
        initialPath?: string
    ) {
        this.queryBuilder = urlQueryBuilder ?? new URLQueryBuilder()
        this.relatedModel = model() as T
        this.path = initialPath ?? (this.relatedModel as any).resource

        if (this.relatedModel.scopes) {
            Object.entries(this.relatedModel.scopes).forEach(([name, scope]) => {
                (this as any)[name] = () => {
                    return this.where(scope as Record<string, any>)
                }
            })
        }
    }

    id(id: string | number): Model<T> { 
        const model = new (this.relatedModel as any)({ id })
        model._path = `${this.path}/${id}`
        return model
    }

    async find(id: string | number): Promise<Model<T>> {
        const url = `${this.path}/${id}${this.queryBuilder.toQueryString() ? `?${this.queryBuilder.toQueryString()}` : ''}`
        const response = await HttpClient.call(url)
        return new (this.relatedModel as any)(response.data)
    }

    where(where: Record<string, any>): RelationBuilder<T> { 
        this.queryBuilder.where(where)
        return this
    }

    filter(filters: Record<string, any>): RelationBuilder<T> { 
        this.queryBuilder.filter(filters)
        return this
    }

    include(relations: string | string[]): RelationBuilder<T> { 
        this.queryBuilder.include(relations)
        return this
    }

    orderBy(field: string, dir: string = 'asc'): RelationBuilder<T> { 
        this.queryBuilder.orderBy(field, dir)
        return this
    }

    limit(n: number): RelationBuilder<T> { 
        this.queryBuilder.limit(n)
        return this
    }

    offset(n: number): RelationBuilder<T> { 
        this.queryBuilder.offset(n)
        return this
    }

    async update(id: string | number, data: Record<string, any>): Promise<Model<T>> {
        const response = await HttpClient.call(`${this.path}/${id}`, {
            method: 'PUT',
            body: data
        })
        return new (this.relatedModel as any)(response.data)
    }

    async create(data: Record<string, any>): Promise<Model<T>> {
        const response = await HttpClient.call(this.path, {
            method: 'POST',
            body: data
        })
        return new (this.relatedModel as any)(response.data)
    }

    async delete(id: string | number): Promise<void> {
        await HttpClient.call(`${this.path}/${id}`, {
            method: 'DELETE'
        })
    }

    protected buildUrl() {
        const queryString = this.queryBuilder.toQueryString()
        const url = queryString ? `${this.path}?${queryString}` : this.path
        this.queryBuilder.reset()
        return decodeURIComponent(`${HttpClient.options.baseUrl}/${url}`)
    }
}
