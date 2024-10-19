import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'difficulties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('label')
    })
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: 1,
          label: '3',
        },
        {
          id: 2,
          label: '4a',
        },
        {
          id: 3,
          label: '4a-',
        },
        {
          id: 4,
          label: '4a+',
        },
        {
          id: 5,
          label: '4b',
        },
        {
          id: 6,
          label: '4b-',
        },
        {
          id: 7,
          label: '4b+',
        },
        {
          id: 8,
          label: '4c',
        },
        {
          id: 9,
          label: '4c-',
        },
        {
          id: 10,
          label: '4c+',
        },
        {
          id: 11,
          label: '5a',
        },
        {
          id: 12,
          label: '5a-',
        },
        {
          id: 13,
          label: '5a+',
        },
        {
          id: 14,
          label: '5b',
        },
        {
          id: 15,
          label: '5b-',
        },
        {
          id: 16,
          label: '5b+',
        },
        {
          id: 17,
          label: '5c',
        },
        {
          id: 18,
          label: '5c-',
        },
        {
          id: 19,
          label: '5c+',
        },
        {
          id: 20,
          label: '6a',
        },
        {
          id: 21,
          label: '6a-',
        },
        {
          id: 22,
          label: '6a+',
        },
        {
          id: 23,
          label: '6b',
        },
        {
          id: 24,
          label: '6b-',
        },
        {
          id: 25,
          label: '6b+',
        },
        {
          id: 26,
          label: '6c',
        },
        {
          id: 27,
          label: '6c-',
        },
        {
          id: 28,
          label: '6c+',
        },
        {
          id: 29,
          label: '7a',
        },
        {
          id: 30,
          label: '7a-',
        },
        {
          id: 31,
          label: '7a+',
        },
        {
          id: 32,
          label: '7b',
        },
        {
          id: 33,
          label: '7b-',
        },
        {
          id: 34,
          label: '7b+',
        },
        {
          id: 35,
          label: '7c',
        },
        {
          id: 36,
          label: '7c-',
        },
        {
          id: 37,
          label: '7c+',
        },
        {
          id: 38,
          label: '8a',
        },
        {
          id: 39,
          label: '8a-',
        },
        {
          id: 40,
          label: '8a+',
        },
        {
          id: 41,
          label: '8b',
        },
        {
          id: 42,
          label: '8b-',
        },
        {
          id: 43,
          label: '8b+',
        },
        {
          id: 44,
          label: '8c',
        },
        {
          id: 45,
          label: '8c-',
        },
        {
          id: 46,
          label: '8c+',
        },
        {
          id: 47,
          label: '9a',
        },
        {
          id: 48,
          label: '9a-',
        },
        {
          id: 49,
          label: '9a+',
        },
        {
          id: 50,
          label: '9b',
        },
        {
          id: 51,
          label: '9b-',
        },
        {
          id: 52,
          label: '9b+',
        },
        {
          id: 53,
          label: '9c',
        },
        {
          id: 54,
          label: '9c-',
        },
        {
          id: 55,
          label: '9c+',
        },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
