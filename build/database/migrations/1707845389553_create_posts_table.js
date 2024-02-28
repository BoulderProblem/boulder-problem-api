import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'posts';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery);
            table
                .uuid('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .notNullable();
            table.string('title');
            table.specificType('image', 'varchar[]');
            table.specificType('text', 'text');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1707845389553_create_posts_table.js.map