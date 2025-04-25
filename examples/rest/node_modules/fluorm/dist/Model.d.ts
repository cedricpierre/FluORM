import { Relation } from './Relations';
export interface Attributes extends Record<string, any> {
    id?: string | number;
}
export declare abstract class Model<A extends Attributes> {
    id?: string | number;
    [key: string]: any;
    static resource: string;
    private static _queryCache;
    constructor(data?: Partial<A>);
    private static getQueryBuilder;
    static query<T extends Model<any>>(this: new (...args: any[]) => T): Relation<T>;
    static where<T extends Model<any>>(this: new (...args: any[]) => T, where: Partial<T>): Relation<T>;
    static filter<T extends Model<any>>(this: new (...args: any[]) => T, filters: Record<string, any>): Relation<T>;
    static include<T extends Model<any>>(this: new (...args: any[]) => T, relations: string | string[]): Relation<T>;
    static all<T extends Model<any>>(this: new (...args: any[]) => T): Promise<T[]>;
    static find<T extends Model<any>>(this: new (...args: any[]) => T, id: string | number): Promise<T>;
    static create<T extends Model<any>>(this: new (...args: any[]) => T, data: Partial<T>): Promise<T>;
    static update<T extends Model<any>>(this: new (...args: any[]) => T, id: string | number, data: Partial<T>): Promise<T>;
    static delete(this: new (...args: any[]) => Model<any>, id: string | number): Promise<void>;
    static firstOrCreate<T extends Model<any>>(this: new (...args: any[]) => T, where: Partial<T>, createData?: Partial<T>): Promise<T>;
    static updateOrCreate<T extends Model<any>>(this: new (...args: any[]) => T, where: Partial<T>, updateData: Partial<T>): Promise<T>;
    save(): Promise<this>;
    update(data?: Partial<this>): Promise<this>;
    delete(): Promise<void>;
}
