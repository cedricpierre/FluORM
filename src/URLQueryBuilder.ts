export class URLQueryBuilder {
    private filters: Record<string, any> = {}
    private includes: string[] = []
    private sort: string[] = []
    private _limit?: number
    private _offset?: number

    where(obj: Record<string, any>): this {
        this.filters = { ...this.filters, ...obj }
        return this
    }

    filter(obj: Record<string, any>): this {
        this.filters = { ...this.filters, ...obj }
        return this
    }

    include(rel: string | string[]): this {
        this.includes.push(...(Array.isArray(rel) ? rel : [rel]))
        return this
    }

    orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
        this.sort.push(`${direction === 'desc' ? '-' : ''}${field}`)
        return this
    }

    limit(n: number): this {
        this._limit = n
        return this
    }

    offset(n: number): this {
        this._offset = n
        return this
    }

    toObject(): Record<string, any> {
        const obj: Record<string, any> = { ...this.filters }
        if (this.includes.length) obj.include = this.includes.join(',')
        if (this.sort.length) obj.sort = this.sort.join(',')
        if (this._limit !== undefined) obj.limit = this._limit
        if (this._offset !== undefined) obj.offset = this._offset
        return obj
    }
}