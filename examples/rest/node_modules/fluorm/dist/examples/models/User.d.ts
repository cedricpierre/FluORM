import { Relation, Model, Attributes } from '../../src/index';
import { Media } from './Media';
import { Thumbnail } from './Thumbnail';
interface IUser extends Attributes {
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}
export declare class User extends Model<IUser> {
    static resource: string;
    medias: Relation<Media[]>;
    thumbnail?: Thumbnail;
    thumbnails?: Thumbnail[];
    static scopes: {
        active: () => {
            status: string;
        };
    };
}
export {};
