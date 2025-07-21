import { BaseSchema } from '@adonisjs/lucid/schema'
import Roles from '../../app/enums/roles.js'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
    })
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: Roles.USER,
          name: 'User',
        },
        {
          id: Roles.MANAGER,
          name: 'Manager',
        },
        {
          id: Roles.ADMIN,
          name: 'Admin',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
