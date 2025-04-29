import { Model } from "./Model"
import { HttpClient, Methods } from "./HttpClient"
import { RelationBuilder } from "./RelationBuilder"

export class HasManyRelationBuilder<T extends Model<any>> extends RelationBuilder<T> {
    async all() {
        const list = await HttpClient.call(this.buildUrl())
        return list.map((i: any) => new (this.relatedModel as any)(i))
    }

    async create(payload: any) {
        const data = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: payload
        })
        return new (this.relatedModel as any)(data)
    }

    async update(where: Record<string, any>, payload: any) {
        this.where(where)
        const data = await HttpClient.call(`${this.path}`, {
            method: Methods.PATCH,
            body: payload
        })
        return new (this.relatedModel as any)(data)
    }

    async delete(where: Record<string, any>) {
        this.where(where)
        await HttpClient.call(`${this.path}`, { method: Methods.DELETE })
    }

    async paginate(page = 1, perPage = 10) {
        this.queryBuilder.page(page)
            .perPage(perPage)
            .offset((page - 1) * perPage)
            .limit(perPage)

        const list = await HttpClient.call(this.buildUrl())
        return list.map((i: any) => new (this.relatedModel as any)(i))
    }

    async firstOrCreate(where: Record<string, any>, createData?: any) {
        this.where(where)
        const list = await HttpClient.call(this.buildUrl())
        const existing = list[0]
        if (existing) return new (this.relatedModel as any)(existing)
        const created = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: createData ?? where
        })
        return new (this.relatedModel as any)(created)
    }

    async updateOrCreate(where: Record<string, any>, updateData: any) {
        this.where(where)
        const list = await HttpClient.call(this.buildUrl())
        const existing = list[0]
        if (existing) {
            const updated = await HttpClient.call(`${this.path}/${existing.id}`, {
                method: Methods.PATCH,
                body: updateData
            })
            return new (this.relatedModel as any)(updated)
        }
        const created = await HttpClient.call(this.path, {
            method: Methods.POST,
            body: { ...where, ...updateData }
        })
        return new (this.relatedModel as any)(created)
    }
}
