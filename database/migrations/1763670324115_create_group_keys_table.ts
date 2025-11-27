import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'group_keys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('conversation_id')
        .unsigned()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')
        .notNullable()
      table.integer('version').notNullable()
      table.text('ciphertext').notNullable()
      table.text('nonce').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.unique(['conversation_id', 'user_id', 'version'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
