import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasManyRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async all() {
        const list = await HttpClient.call(this.buildUrl())
        return list.data?.map((i: any) => new (this.relatedModel as any)(i))
    }

    async create(payload: any) {
        const data = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: payload
        })
        return new (this.relatedModel as any)(data.data)
    }

    async paginate(page = 1, perPage = 10) {
        this.queryBuilder.page(page)
            .perPage(perPage)
            .offset((page - 1) * perPage)
            .limit(perPage)

        const list = await HttpClient.call(this.buildUrl())
        return list.data?.map((i: any) => new (this.relatedModel as any)(i))
    }
}
