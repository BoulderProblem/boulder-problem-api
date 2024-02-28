import { BaseSchema } from '@adonisjs/lucid/schema';
import Genders from '../../app/enums/genders.js';
import Roles from '../../app/enums/roles.js';
export default class extends BaseSchema {
    tableName = 'users';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('role_id').unsigned().references('id').inTable('roles').defaultTo(Roles.USER);
            table
                .integer('gender_id')
                .unsigned()
                .references('id')
                .inTable('genders')
                .defaultTo(Genders.HOMME);
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('role_id');
            table.dropColumn('gender_id');
        });
    }
}
//# sourceMappingURL=1707769712085_update_users_table.js.map