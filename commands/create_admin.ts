import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class CreateAdmin extends BaseCommand {
  static commandName = 'create:admin'
  static description = 'Create an admin user'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of the admin user' })
  declare email: string

  @args.string({ description: 'Password for the admin user' })
  declare password: string

  @flags.string({ description: 'First name', default: 'Admin' })
  declare firstname: string

  @flags.string({ description: 'Last name', default: 'User' })
  declare lastname: string

  async run() {
    this.logger.info('Creating admin user...')

    try {
      // Check if user already exists
      const existingUser = await User.findBy('email', this.email)
      if (existingUser) {
        this.logger.error(`User with email ${this.email} already exists`)
        return
      }

      // Create admin user
      const user = await User.create({
        email: this.email,
        password: this.password,
        firstname: this.firstname,
        lastname: this.lastname,
        birth_date: new Date('1990-01-01'), // Default birth date
        genderId: 1, // Default gender
        roleId: 2, // Admin role (verify in your roles table)
      })

      this.logger.success(`Admin user created successfully!`)
      this.logger.info(`ID: ${user.id}`)
      this.logger.info(`Email: ${user.email}`)
      this.logger.info(`Name: ${user.firstname} ${user.lastname}`)
    } catch (error) {
      this.logger.error('Failed to create admin user')
      this.logger.error(error.message)
    }
  }
}
