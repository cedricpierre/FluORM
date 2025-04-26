export declare class URLQueryBuilder {
    private _filters;
    private _includes;
    private _sort;
    private _limit?;
    private _offset?;
    private _page?;
    private _perPage?;
    reset(): this;
    where(obj: Record<string, any>): this;
    filter(obj: Record<string, any>): this;
    include(rel: string | string[]): this;
    orderBy(field: string, direction?: string): this;
    limit(n: number): this;
    offset(n: number): this;
    page(n: number): this;
    perPage(n: number): this;
    toObject(): Record<string, any>;
}
