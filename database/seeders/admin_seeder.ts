import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Check if admin already exists
    const existingAdmin = await User.findBy('email', 'admin@boulder.com')
    
    if (!existingAdmin) {
      await User.create({
        email: 'admin@boulder.com',
        password: 'admin123', // Will be hashed automatically by the model
        firstname: 'Admin',
        lastname: 'Boulder',
        birth_date: new Date('1990-01-01'),
        genderId: 1,
        roleId: 2, // Admin role (verify in your roles table)
      })
      
      console.log('✅ Admin user created: admin@boulder.com / admin123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }
  }
}
