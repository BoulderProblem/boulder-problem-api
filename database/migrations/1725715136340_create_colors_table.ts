import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'colors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('color')
      table.string('label')
    })
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: 1,
          color: '#ffffff', // blanc
          label: 'Blanc',
        },
        {
          id: 2,
          color: '#fb510c', // orange
          label: 'Orange',
        },
        {
          id: 3,
          color: '#368100', // vert
          label: 'Vert',
        },
        {
          id: 4,
          color: '#004487', // bleu
          label: 'Bleu',
        },
        {
          id: 5,
          color: '#8a1f01', // rouge
          label: 'Rouge',
        },
        {
          id: 6,
          color: '#000000', // noir
          label: 'Noir',
        },
        {
          id: 7,
          color: '#923272', // violet
          label: 'Violet',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
