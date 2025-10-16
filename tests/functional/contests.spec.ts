import { test } from '@japa/runner'
import { createAdminUser } from '#tests/helpers/create_user'
import Place from '#models/place'
import db from '@adonisjs/lucid/services/db'

test.group('Contests', (group) => {
  let authToken: string
  let user: any
  let contestId: number
  let placeId: number

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      user = await createAdminUser()

      const loginResponse = await context.client.post('/login').json({
        email: user.email,
        password: 'password123',
      })

      authToken = loginResponse.body().token
    }
  })

  test('should create a contest', async ({ client, assert }) => {
    // Créer une place pour le test
    const place = await Place.create({
      coordinate: db.raw('point(48.8566, 2.3522)'),
      geocoordinate: db.raw("ST_GeomFromText('POINT(2.3522 48.8566)', 4326)"),
      osmId: 'test-contest-place',
      sportCenter: true,
      name: 'Test Climbing Gym',
      city: 'Paris',
      postalCode: '75001',
      address: '1 Rue de Test, 75001 Paris',
      outdoor: false,
    })
    placeId = place.id as unknown as number

    const response = await client.post('/contests').bearerToken(authToken).json({
      name: 'Test Contest',
      description: 'A test contest',
      start_date: '2025/08/12',
      end_date: '2025/11/12',
      user_id: user.id,
      place_id: placeId,
    })

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'name', 'description'])
    contestId = response.body().id
  })

  test('should get list of contests', async ({ client, assert }) => {
    const response = await client.get('/contests').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body().data)
  })

  test('should get a specific contest', async ({ client, assert }) => {
    const response = await client.get(`/contests/${contestId}`).bearerToken(authToken)

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'name'])
  })

  test('should update a contest', async ({ client, assert }) => {
    const response = await client.put(`/contests/${contestId}`).bearerToken(authToken).json({
      name: 'Updated Contest Name',
      description: 'A test contest',
      start_date: '2025/08/12',
      end_date: '2025/11/12',
      user_id: user.id,
      status: 'waiting',
    })

    response.assertStatus(200)
    assert.equal(response.body().name, 'Updated Contest Name')
  })

  test('should follow a contest', async ({ client }) => {
    const response = await client
      .post(`/contests/${contestId}/follow`)
      .bearerToken(authToken)
      .json({
        follow: true,
      })

    response.assertStatus(200)
  })

  test('should get contest ways', async ({ client, assert }) => {
    const response = await client.get(`/contests/${contestId}/ways`).bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should get contest users', async ({ client, assert }) => {
    const response = await client.get(`/contests/${contestId}/users`).bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should get contest ranking', async ({ client, assert }) => {
    const response = await client.get(`/contests/${contestId}/ranking`).bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should delete a contest', async ({ client }) => {
    const response = await client.delete(`/contests/${contestId}`).bearerToken(authToken)

    response.assertStatus(200)
  })

  test('should fail to access contests without auth', async ({ client }) => {
    const response = await client.get('/contests')

    response.assertStatus(401)
  })
})
