import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'zones'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('place_id')
        .unsigned()
        .references('id')
        .inTable('places')
        .onDelete('CASCADE')
        .notNullable()
      table.string('name')
      table.string('floor')
      table.string('image')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
