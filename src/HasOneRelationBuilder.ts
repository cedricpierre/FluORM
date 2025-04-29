import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasOneRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async first() {
        const data = await HttpClient.call(this.buildUrl())
        return new (this.relatedModel as any)(data)
    }

    async update(data: any) {
        const existing = await HttpClient.call(this.buildUrl())
        const updated = await HttpClient.call(`${this.path}/${existing.id}`, {
            method: Methods.PATCH,
            body: data
        })
        return new (this.relatedModel as any)(updated)
    }

    async delete() {
        const existing = await HttpClient.call(this.buildUrl())
        return await HttpClient.call(`${this.path}/${existing.id}`, { method: Methods.DELETE })
    }
}
