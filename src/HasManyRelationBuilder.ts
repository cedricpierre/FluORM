import { HttpClient, Methods } from "./HttpClient"
import { Attributes, Model } from "./Model"
import { RelationBuilder } from "./RelationBuilder"

export class HasManyRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async all(): Promise<T[]> {
        const list = await HttpClient.call(this.buildUrl())
        return list?.map((i: any) => new (this.relatedModel as any)(i))
    }

    async create(data: Partial<Attributes>): Promise<T> {
        const response = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: data
        })
        return new (this.relatedModel as any)(response)
    }

    async delete(id: string | number): Promise<void> {
        await HttpClient.call(`${this.path}/${id}`, { method: Methods.DELETE })
    }

    async update(id: string | number, data: Partial<Attributes>): Promise<T> {
        const response = await HttpClient.call(`${this.path}/${id}`, {
            method: Methods.PUT,
            body: data
        })
        return new (this.relatedModel as any)(response)
    }

    async paginate(page = 1, perPage = 10): Promise<T[]> {
        this.queryBuilder.page(page)
            .perPage(perPage)
            .offset((page - 1) * perPage)
            .limit(perPage)

        const list = await HttpClient.call(this.buildUrl())
        return list?.map((i: any) => new (this.relatedModel as any)(i))
    }
}
