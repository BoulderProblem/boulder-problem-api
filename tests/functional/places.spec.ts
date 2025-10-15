import { test } from '@japa/runner'

test.group('Places', (group) => {
  let authToken: string
  let placeId: number

  group.each.setup(async ({ context }) => {
    const email = `places-test-${Date.now()}@example.com`
    await context.client.post('/register').json({
      firstname: 'Place',
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
  })

  test('should get list of places', async ({ client, assert }) => {
    const response = await client.get('/places?search=a').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })

  test('should get a specific place by id', async ({ client, assert }) => {
    // First get list to have a valid ID
    const listResponse = await client.get('/places').bearerToken(authToken)

    if (listResponse.body().length > 0) {
      placeId = listResponse.body()[0].id
      const response = await client.get(`/places/${placeId}`).bearerToken(authToken)

      response.assertStatus(200)
      assert.properties(response.body(), ['id', 'name'])
    }
  })

  test('should get zones of a place', async ({ client, assert }) => {
    if (placeId) {
      const response = await client.get(`/places/${placeId}/zones`).bearerToken(authToken)

      response.assertStatus(200)
      assert.isArray(response.body())
    }
  })

  test('should get all ways of a place', async ({ client, assert }) => {
    if (placeId) {
      const response = await client.get(`/places/${placeId}/allways`).bearerToken(authToken)

      response.assertStatus(200)
      assert.isArray(response.body())
    }
  })

  test('should favorite a place', async ({ client }) => {
    if (placeId) {
      const response = await client.post(`/places/${placeId}/favorite`).bearerToken(authToken)

      response.assertStatus(200)
    }
  })

  test('should fail to access places without auth', async ({ client }) => {
    const response = await client.get('/places')

    response.assertStatus(401)
  })
})
