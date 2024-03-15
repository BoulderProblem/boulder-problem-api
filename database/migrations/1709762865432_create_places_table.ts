import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'places'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.point('coordinate').notNullable()
      table.geometry('geocoordinate').notNullable()
      table.string('osm_id')
      table.boolean('sport_center')
      table.string('name')
      table.string('hours')
      table.string('phone')
      table.string('website')
      table.string('city')
      table.string('postal_code')
      table.string('address')
      table.boolean('outdoor')
      table.string('grade_min')
      table.string('grade_max')
      table.string('length_min')
      table.string('length_max')
      table.string('routes')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
