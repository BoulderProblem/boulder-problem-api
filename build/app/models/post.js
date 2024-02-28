var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { column, BaseModel, belongsTo, hasMany } from '@adonisjs/lucid/orm';
import User from './user.js';
import Like from './like.js';
import Comment from './comment.js';
export default class Post extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    column(),
    __metadata("design:type", Array)
], Post.prototype, "image", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "text", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Post.prototype, "user_id", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "likes_count", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "comments_count", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Post.prototype, "is_like", void 0);
__decorate([
    hasMany(() => Like, {
        foreignKey: 'post_id',
        serializeAs: null,
    }),
    __metadata("design:type", Object)
], Post.prototype, "likes", void 0);
__decorate([
    hasMany(() => Comment, {
        foreignKey: 'post_id',
    }),
    __metadata("design:type", Object)
], Post.prototype, "comments", void 0);
__decorate([
    belongsTo(() => User, { foreignKey: 'user_id' }),
    __metadata("design:type", Object)
], Post.prototype, "user", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Post.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Post.prototype, "updatedAt", void 0);
//# sourceMappingURL=post.js.map