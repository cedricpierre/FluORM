import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasOneRelationBuilder extends RelationBuilder<any> {
    async get(): Promise<typeof this.relatedModel> {
        const response = await HttpClient.call(`${this.path}/${this.relatedModel.id}`, { method: Methods.GET })
        return new (this.relatedModel as any)(response)
    }

    async update(data: any): Promise<typeof this.relatedModel> {
        const updated = await HttpClient.call(`${this.path}/${this.relatedModel.id}`, {
            method: Methods.PATCH,
            body: data
        })
        return new (this.relatedModel as any)(updated)
    }

    async delete(): Promise<void> {
        await HttpClient.call(`${this.path}/${this.relatedModel.id}`, { method: Methods.DELETE })
    }
}
