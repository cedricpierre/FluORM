import { Relation, Model, Attributes } from '../../src/index';
import { User } from './User';
import { Thumbnail } from './Thumbnail';
export interface IMedia extends Attributes {
    id: string;
    name: string;
    size: string;
    extension: string;
    mime_type: string;
    url: string;
}
export declare class Media extends Model<IMedia> {
    static resource: string;
    user: Relation<User>;
    thumbnails: Relation<Thumbnail[]>;
}
