import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ways'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('wall_id')
        .unsigned()
        .references('id')
        .inTable('walls')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('color_id').unsigned().references('id').inTable('colors').notNullable()
      table
        .integer('difficulty_id')
        .unsigned()
        .references('id')
        .inTable('difficulties')
        .notNullable()
      table.string('style')
      table.string('route_setter')
      table.string('name')
      table.string('image')
      table.timestamp('created_at')
      table.timestamp('delete_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
