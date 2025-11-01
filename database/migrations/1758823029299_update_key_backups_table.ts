import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'key_backups'

  async up() {
    // supprimer le champ ciphertext, nonce, salt
    this.schema.alterTable(this.tableName, (table) => {
      table.text('ciphertext_srv').notNullable()
      table.string('nonce_srv').notNullable()
      table.string('salt_srv').notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ciphertext_srv')
      table.dropColumn('nonce_srv')
      table.dropColumn('salt_srv')
    })
  }
}
