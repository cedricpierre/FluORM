export class URLBuilder {
    private path: string
    private queryParams: Record<string, any> = {}

    constructor(base: string) {
        this.path = base
    }

    query(params: Record<string, any>): this {
        this.queryParams = { ...this.queryParams, ...params }
        return this
    }

    toString(): string {
        const query = new URLSearchParams(this.queryParams).toString()
        const url = query ? `${this.path}?${query}` : this.path
        return decodeURIComponent(url)
    }
}