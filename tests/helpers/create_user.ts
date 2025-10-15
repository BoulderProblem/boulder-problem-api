import User from '#models/user'

export async function createUser(data: {
  email: string
  password: string
  firstname?: string
  lastname?: string
  roleId?: number
}) {
  return await User.create({
    email: data.email,
    password: data.password,
    firstname: data.firstname || 'Test',
    lastname: data.lastname || 'User',
    birth_date: new Date('1995-06-28'),
    genderId: 1,
    roleId: data.roleId || 1, // 1 = user normal, 2 = admin (à adapter selon ta table roles)
  })
}

export async function createAdminUser(email?: string, password?: string) {
  return await createUser({
    email: email || `admin-${Date.now()}@test.com`,
    password: password || 'password123',
    firstname: 'Admin',
    lastname: 'Test',
    roleId: 2, // Rôle admin (à vérifier dans ta table roles)
  })
}
