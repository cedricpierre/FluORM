export class URLQueryBuilder {
    _filters = {};
    _includes = [];
    _sort = [];
    _limit;
    _offset;
    _page;
    _perPage;
    where(obj) {
        return this.filter(obj);
    }
    filter(obj) {
        this._filters = { ...this._filters, ...obj };
        return this;
    }
    include(rel) {
        this._includes.push(...(Array.isArray(rel) ? rel : [rel]));
        return this;
    }
    orderBy(field, direction = 'asc') {
        this._sort.push(`${direction === 'desc' ? '-' : ''}${field}`);
        return this;
    }
    limit(n) {
        this._limit = n;
        return this;
    }
    offset(n) {
        this._offset = n;
        return this;
    }
    page(n) {
        this._page = n;
        return this;
    }
    perPage(n) {
        this._perPage = n;
        return this;
    }
    toObject() {
        const obj = { ...this._filters };
        if (this._includes.length)
            obj.include = this._includes.join(',');
        if (this._sort.length)
            obj.sort = this._sort.join(',');
        if (this._limit !== undefined)
            obj.limit = this._limit;
        if (this._offset !== undefined)
            obj.offset = this._offset;
        if (this._page !== undefined)
            obj.page = this._page;
        if (this._perPage !== undefined)
            obj.per_page = this._perPage;
        return obj;
    }
}
