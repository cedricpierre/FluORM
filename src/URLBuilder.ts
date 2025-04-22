class URLBuilder {
    private path: string
    private queryParams: Record<string, any> = {}

    constructor(base: string) {
        this.path = base
    }

    append(segment: string): this {
        this.path = this.path.replace(/\/+$/, '') + '/' + segment.replace(/^\/+/, '')
        return this
    }

    query(params: Record<string, any>): this {
        this.queryParams = { ...this.queryParams, ...params }
        return this
    }

    toString(): string {
        const query = new URLSearchParams(this.queryParams).toString()
        return query ? `${this.path}?${query}` : this.path
    }
}