import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { URLQueryBuilder } from "./URLQueryBuilder"

export type Relation<T> = any
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>

export class RelationBuilder<T extends Model<any>> {
    protected queryBuilder: URLQueryBuilder
    protected relatedModel: Model<any>
    protected path: string

    constructor(
        modelFactory: () => Model<any>,
        parent?: Model<any>,
        urlQueryBuilder?: URLQueryBuilder,
        resource?: string
    ) {
        this.queryBuilder = urlQueryBuilder ?? new URLQueryBuilder()
        this.relatedModel = modelFactory()
        
        this.path = resource ?? (parent as any)?.resource ?? (this.relatedModel as any).resource
        
        if(parent) {
            this.path = `${parent.resource}/${this.path}`
        }

        if ((this.relatedModel as Model<any>).scopes) {
            Object.entries((this.relatedModel as Model<any>).scopes).forEach(([name, scope]) => {
                (this as any)[name] = () => {
                    return this.where(scope as Record<string, any>)
                }
            })
        }
    }

    id(id: string | number) { 
        const item = new (this.relatedModel as any)({id})
        item.resource = `${this.path}/${id}`
        return item
    }

    async find(id: string) {
        const item = await HttpClient.call(`${this.path}/${id}`)
        return new (this.relatedModel as any)(item)
    }

    where(where: Record<string, any>) { 
        this.queryBuilder.where(where)
        return this
    }

    filter(filters: Record<string, any>) { 
        this.queryBuilder.filter(filters)
        return this
    }

    include(relations: string | string[]) { 
        this.queryBuilder.include(relations)
        return this
    }

    orderBy(field: string, dir: string = 'asc') { 
        this.queryBuilder.orderBy(field, dir)
        return this
    }

    limit(n: number) { 
        this.queryBuilder.limit(n)
        return this
    }

    offset(n: number) { 
        this.queryBuilder.offset(n)
        return this
    }

    protected buildUrl() {
        const queryObject = this.queryBuilder.toObject()
        const url = Object.keys(queryObject).length > 0 ? `${this.path}?${new URLSearchParams(queryObject).toString()}` : this.path
        this.queryBuilder.reset()
        return decodeURIComponent(`${HttpClient.options.baseUrl}/${url}`)
    }
}
