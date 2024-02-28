import { BaseSchema } from '@adonisjs/lucid/schema';
import Genders from '../../app/enums/genders.js';
export default class extends BaseSchema {
    tableName = 'genders';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name', 50).notNullable();
        });
        this.defer(async (db) => {
            await db.table(this.tableName).multiInsert([
                {
                    id: Genders.HOMME,
                    name: 'Homme',
                },
                {
                    id: Genders.FEMME,
                    name: 'Femmme',
                },
            ]);
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1707691522587_create_genders_table.js.map