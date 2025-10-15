import { test } from '@japa/runner'

test.group('Colors & Difficulties', (group) => {
  let authToken: string

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      const email = `ref-test-${Date.now()}@example.com`
      await context.client.post('/register').json({
      firstname: 'Ref',
      lastname: 'Tester',
      email,
      password: 'password123',
      birth_date: '1995/06/28',
        genderId: 1,
      })

      const loginResponse = await context.client.post('/login').json({
      email,
        password: 'password123',
      })

      authToken = loginResponse.body().token
    }
  })

  test('should get list of colors', async ({ client, assert }) => {
    const response = await client.get('/colors').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should get list of difficulties', async ({ client, assert }) => {
    const response = await client.get('/difficulties').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should fail to get colors without auth', async ({ client }) => {
    const response = await client.get('/colors')

    response.assertStatus(401)
  })

  test('should fail to get difficulties without auth', async ({ client }) => {
    const response = await client.get('/difficulties')

    response.assertStatus(401)
  })
})
