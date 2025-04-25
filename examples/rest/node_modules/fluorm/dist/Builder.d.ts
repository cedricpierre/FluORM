import { Model } from "./Model";
import { URLQueryBuilder } from "./URLQueryBuilder";
import { type RelationType } from "./Relations";
export declare class Builder {
    static build<T extends Model<any>>(modelFactory: () => new (...args: any[]) => T, parent?: Model<any>, key?: string | symbol, relationType?: RelationType, urlQueryBuilder?: URLQueryBuilder): any;
}
