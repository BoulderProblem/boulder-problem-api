import { test } from '@japa/runner'

test.group('Users', (group) => {
  let authToken: string
  let userId: number

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      const email = `users-test-${Date.now()}@example.com`
      await context.client.post('/register').json({
        firstname: 'User',
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

      let user = await context.client.get('/user').bearerToken(authToken)
      userId = user.body().id
    }
  })

  test('should get current user profile', async ({ client, assert }) => {
    const response = await client.get('/user').bearerToken(authToken)

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'firstname', 'lastname', 'email'])
  })

  test('should get list of users', async ({ client, assert }) => {
    const response = await client.get('/users?search=').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })

  test('should get user by id', async ({ client, assert }) => {
    const response = await client.get(`/users/${userId}`).bearerToken(authToken)

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'firstname', 'lastname'])
  })

  test('should update user profile', async ({ client, assert }) => {
    const response = await client.put(`/users/${userId}`).bearerToken(authToken).json({
      firstname: 'Updated',
      lastname: 'Name',
    })

    response.assertStatus(200)
    assert.equal(response.body().firstname, 'Updated')
  })

  test('should follow a user', async ({ client }) => {
    // Create another user to follow
    const email2 = `follow-target-${Date.now()}@example.com`
    await client.post('/register').json({
      firstname: 'Follow',
      lastname: 'Target',
      email: email2,
      password: 'password123',
      birth_date: '1995/06/28',
      genderId: 1,
    })

    const loginResponse2 = await client.post('/login').json({
      email: email2,
      password: 'password123',
    })

    let user = await client.get('/user').bearerToken(authToken)

    const targetUserId = user.body().id

    const response = await client.post(`/users/${targetUserId}/follow`).bearerToken(authToken)

    response.assertStatus(200)
  })

  test('should get user posts', async ({ client, assert }) => {
    const response = await client.get(`/users/${userId}/posts`).bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })

  test('should fail to access users without auth', async ({ client }) => {
    const response = await client.get('/users')

    response.assertStatus(401)
  })
})
