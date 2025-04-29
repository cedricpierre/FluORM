export class URLQueryBuilder {
    private _filters: Record<string, any> = {}
    private _includes: string[] = []
    private _sort: string[] = []
    private _limit?: number
    private _offset?: number
    private _page?: number
    private _perPage?: number

    reset(): this {
        this._filters = {}
        this._includes = []
        this._sort = []
        this._limit = undefined
        this._offset = undefined
        this._page = undefined
        this._perPage = undefined
        return this
    }
    
    where(obj: Record<string, any>): this {
        return this.filter(obj)
    }

    filter(obj: Record<string, any>): this {
        this._filters = { ...this._filters, ...obj }
        return this
    }

    include(rel: string | string[]): this {
        this._includes.push(...(Array.isArray(rel) ? rel : [rel]))
        return this
    }

    orderBy(field: string, direction: string = 'asc'): this {
        this._sort.push(`${direction === 'desc' ? '-' : ''}${field}`)
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


    page(n: number): this {
        this._page = n
        return this
    }

    perPage(n: number): this {
        this._perPage = n
        return this
    }

    toObject(): Record<string, any> {
        const obj: Record<string, any> = { ...this._filters }
        if (this._includes.length) obj.include = this._includes.join(',')
        if (this._sort.length) obj.sort = this._sort.join(',')
        if (this._limit !== undefined) obj.limit = this._limit
        if (this._offset !== undefined) obj.offset = this._offset
        if (this._page !== undefined) obj.page = this._page
        if (this._perPage !== undefined) obj.per_page = this._perPage

        return obj
    }

    toQueryString(): string {
        return Object.entries(this.toObject())
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
    }
}