import { HttpClient, Methods } from "./HttpClient"
import { Model } from "./Model"
import { RelationBuilder } from "./RelationBuilder"

export class HasManyRelationBuilder extends RelationBuilder<Model<any>> {
    async all(): Promise<typeof this.relatedModel[]> {
        const list = await HttpClient.call(this.buildUrl())
        return list?.map((i: any) => new (this.relatedModel as any)(i))
    }

    async create(payload: any): Promise<typeof this.relatedModel> {
        const data = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: payload
        })
        return new (this.relatedModel as any)(data)
    }

    async delete(id: string | number): Promise<void> {
        await HttpClient.call(`${this.path}/${id}`, { method: Methods.DELETE })
    }

    async update(id: string | number, data: Record<string, any>): Promise<typeof this.relatedModel> {
        const response = await HttpClient.call(`${this.path}/${id}`, {
            method: Methods.PUT,
            body: data
        })
        return new (this.relatedModel as any)(response)
    }

    async paginate(page = 1, perPage = 10): Promise<typeof this.relatedModel[]> {
        this.queryBuilder.page(page)
            .perPage(perPage)
            .offset((page - 1) * perPage)
            .limit(perPage)

        const list = await HttpClient.call(this.buildUrl())
        return list?.map((i: any) => new (this.relatedModel as any)(i))
    }
}
