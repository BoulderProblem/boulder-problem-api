import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ways_contests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('way_id')
        .unsigned()
        .references('id')
        .inTable('ways')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('contest_id')
        .unsigned()
        .references('id')
        .inTable('contests')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
