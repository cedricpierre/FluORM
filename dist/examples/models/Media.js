var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model, BelongsTo, HasMany } from '../../src/index';
import { User } from './User';
import { Thumbnail } from './Thumbnail';
export class Media extends Model {
    static resource = 'medias';
}
__decorate([
    BelongsTo(() => User),
    __metadata("design:type", Object)
], Media.prototype, "user", void 0);
__decorate([
    HasMany(() => Thumbnail),
    __metadata("design:type", Object)
], Media.prototype, "thumbnails", void 0);
