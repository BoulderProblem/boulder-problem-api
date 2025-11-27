import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users_conversations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role').defaultTo('member')
      table.unique(['conversation_id', 'user_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
