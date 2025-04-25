export declare class URLBuilder {
    private path;
    private queryParams;
    constructor(base: string);
    query(params: Record<string, any>): this;
    toString(): string;
}
