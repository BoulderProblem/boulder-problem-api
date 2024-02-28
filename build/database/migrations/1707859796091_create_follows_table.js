import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'follows';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery);
            table
                .uuid('user_follower_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .notNullable();
            table
                .uuid('user_following_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .notNullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1707859796091_create_follows_table.js.map