import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Color extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare color: string

  @column()
  declare label: string
}
