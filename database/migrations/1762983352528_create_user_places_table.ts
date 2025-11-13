import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_places'

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
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    this.schema.alterTable('places', (table) => {
      table.dropColumn('owner_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.alterTable('places', (table) => {
      table.uuid('owner_id').unsigned().references('id').inTable('users')
    })
  }
}
