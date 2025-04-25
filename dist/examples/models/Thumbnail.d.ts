import { Media } from './Media';
import { Relation, Model } from '../../src/index';
export declare class Thumbnail extends Model<any> {
    static resource: string;
    media: Relation<Media>;
}
