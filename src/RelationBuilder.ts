import { Model } from "./Model"
import { HttpClient } from "./HttpClient"
import { URLQueryBuilder } from "./URLQueryBuilder"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export class RelationBuilder<T extends Model<any>> {
    protected queryBuilder: URLQueryBuilder
    protected relatedModel: T
    protected path: string = ''
    protected currentId?: string | number

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
        this.currentId = id
        return new (this.relatedModel as any)({ id })
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

    protected buildUrl() {

        const basePath = this.currentId ? `${this.path}/${this.currentId}` : this.path
        const queryString = this.queryBuilder.toQueryString()
        const url = queryString ? `${basePath}?${queryString}` : basePath
        this.queryBuilder.reset()
        return decodeURIComponent(`${HttpClient.options.baseUrl}/${url}`)
    }
}
