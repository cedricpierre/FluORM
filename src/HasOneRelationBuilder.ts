import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasOneRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async update(data: any) {
        const existing = await HttpClient.call(this.buildUrl())
        const updated = await HttpClient.call(`${this.path}/${existing.data.id}`, {
            method: Methods.PATCH,
            body: data
        })
        return new (this.relatedModel as any)(updated.data)
    }

    async delete() {
        const existing = await HttpClient.call(this.buildUrl())
        return await HttpClient.call(`${this.path}/${existing.data.id}`, { method: Methods.DELETE })
    }
}
