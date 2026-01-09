import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('location')
      table.timestamp('start_time')
      table.timestamp('end_time')
      table.integer('activity')
      table.integer('feeling')
      table.string('private_note')
      table.integer('materials')
      table.integer('visibility')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('location')
      table.dropColumn('start_time')
      table.dropColumn('end_time')
      table.dropColumn('activity')
      table.dropColumn('feeling')
      table.dropColumn('private_note')
      table.dropColumn('materials')
      table.dropColumn('visibility')
    })
  }
}
