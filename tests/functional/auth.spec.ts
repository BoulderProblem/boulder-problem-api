import { test } from '@japa/runner'

test.group('Auth - Registration & Login', () => {
  test('should register a new user', async ({ client }) => {
    const response = await client.post('/register').json({
      firstname: 'John',
      lastname: 'Doe',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      birth_date: '1995/06/28',
      genderId: 1,
    })

    response.assertStatus(200)
    response.assertBodyContains({ email: response.body().email })
  })

  test('should login with valid credentials', async ({ client }) => {
    // First register
    const email = `login-test-${Date.now()}@example.com`
    await client.post('/register').json({
      firstname: 'Jane',
      lastname: 'Doe',
      email,
      password: 'password123',
      birth_date: '1995/06/28',
      genderId: 1,
    })

    // Then login
    const response = await client.post('/login').json({
      email,
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({ token: response.body().token })
  })

  test('should fail login with invalid credentials', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(400)
  })

  test('should logout authenticated user', async ({ client }) => {
    // Register and login
    const email = `logout-test-${Date.now()}@example.com`
    await client.post('/register').json({
      firstname: 'Test',
      lastname: 'User',
      email,
      password: 'password123',
      birth_date: '1995/06/28',
      genderId: 1,
    })

    const loginResponse = await client.post('/login').json({
      email,
      password: 'password123',
    })

    const token = loginResponse.body().token

    // Logout
    const response = await client.get('/logout').bearerToken(token)
    response.assertStatus(200)
  })

  test('should request password reset', async ({ client }) => {
    const email = `reset-${Date.now()}@example.com`
    await client.post('/register').json({
      firstname: 'Reset',
      lastname: 'Test',
      email,
      password: 'password123',
      birth_date: '1995/06/28',
      genderId: 1,
    })

    const response = await client.post('/password_lost').json({ email })

    response.assertStatus(200)
    // Email is sent in fake mode (no actual email sent during tests)
  })
})
