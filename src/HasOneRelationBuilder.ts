import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasOneRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async get() {
        const response = await HttpClient.call(`${this.path}/${this.relatedModel.id}`, { method: Methods.GET })
        return new (this.relatedModel as any)(response.data)
    }

    async update(data: any) {
        const updated = await HttpClient.call(`${this.path}/${this.relatedModel.id}`, {
            method: Methods.PATCH,
            body: data
        })
        return new (this.relatedModel as any)(updated.data)
    }

    async delete() {
        return await HttpClient.call(`${this.path}/${this.relatedModel.id}`, { method: Methods.DELETE })
    }
}
