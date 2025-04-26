import { Model } from "./Model";
import { URLQueryBuilder } from "./URLQueryBuilder";
export type Relation<T> = any;
export type RelationFor<T> = T extends Array<any> ? Relation<T> : Relation<T[]>;
export declare const Relations: {
    readonly hasOne: "hasOne";
    readonly hasMany: "hasMany";
    readonly belongsTo: "belongsTo";
    readonly belongsToMany: "belongsToMany";
};
export type RelationType = keyof typeof Relations;
export declare class RelationBuilder {
    static build<T extends Model<any>>(modelFactory: () => new (...args: any[]) => T, parent?: Model<any>, key?: string | symbol, relationType?: RelationType, urlQueryBuilder?: URLQueryBuilder, resource?: string): Relation<T>;
}
