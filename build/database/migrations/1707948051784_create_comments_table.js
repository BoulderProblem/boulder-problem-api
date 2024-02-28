import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'comments';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery);
            table.uuid('user_id').unsigned().references('id').inTable('users').notNullable();
            table
                .uuid('post_id')
                .unsigned()
                .references('id')
                .inTable('posts')
                .onDelete('CASCADE')
                .notNullable();
            table.string('text');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1707948051784_create_comments_table.js.map