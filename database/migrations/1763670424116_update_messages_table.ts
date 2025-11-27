import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('key_version').notNullable().defaultTo(1)
      table.dropColumn('receiver_id')
      table.dropColumn('sender_pub')
      table.dropColumn('recipient_pub')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('key_version')
      table.string('sender_pub').notNullable()
      table.string('recipient_pub').notNullable()
      table
        .uuid('receiver_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
    })
  }
}
