import { test } from '@japa/runner'

test.group('Feed', (group) => {
  let authToken: string

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      const email = `feed-test-${Date.now()}@example.com`
      await context.client.post('/register').json({
        firstname: 'Feed',
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

  test('should get user feed', async ({ client, assert }) => {
    const response = await client.get('/feed').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })

  test('should fail to get feed without auth', async ({ client }) => {
    const response = await client.get('/feed')

    response.assertStatus(401)
  })
})
