import { test } from '@japa/runner'

test.group('Messages & Conversations', (group) => {
  let authToken: string
  let authToken2: string
  let conversationId: number
  let userId: number
  let userId2: number

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      // Create first user
      const email1 = `msg-user1-${Date.now()}@example.com`
      await context.client.post('/register').json({
        firstname: 'Message',
        lastname: 'User1',
        email: email1,
        password: 'password123',
        birth_date: '1995/06/28',
        genderId: 1,
      })

      const loginResponse1 = await context.client.post('/login').json({
        email: email1,
        password: 'password123',
      })

      authToken = loginResponse1.body().token

      let user = await context.client.get('/user').bearerToken(authToken)
      userId = user.body().id

      // Create second user
      const email2 = `msg-user2-${Date.now()}@example.com`
      await context.client.post('/register').json({
        firstname: 'Message',
        lastname: 'User2',
        email: email2,
        password: 'password123',
        birth_date: '1995/06/28',
        genderId: 1,
      })

      const loginResponse2 = await context.client.post('/login').json({
        email: email2,
        password: 'password123',
      })

      authToken2 = loginResponse2.body().token
      let user2 = await context.client.get('/user').bearerToken(authToken)
      userId2 = user2.body().id
    }
  })

  test('should create a conversation', async ({ client, assert }) => {
    const response = await client
      .post('/conversations')
      .bearerToken(authToken)
      .json({
        userIds: [userId, userId2],
      })

    response.assertStatus(200)
    assert.isArray(response.body())
    conversationId = response.body()[0].id
  })

  test('should get list of conversations', async ({ client, assert }) => {
    const response = await client.get('/conversations').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should get a specific conversation', async ({ client, assert }) => {
    const response = await client.get(`/conversations/${conversationId}`).bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
    assert.equal(response.body()[0].id, conversationId)
  })

  test('should send a message', async ({ client, assert }) => {
    const response = await client.post('/messages').bearerToken(authToken).json({
      conversationId: conversationId,
      text: 'Hello, this is a test message',
      sender_id: userId,
      receiver_id: userId2,
      ciphertext: 'encrypted_message',
      nonce: 'random_nonce',
      sender_pub: 'sender_public_key',
      recipient_pub: 'recipient_public_key',
    })

    response.assertStatus(200)
    assert.properties(response.body(), ['id', 'ciphertext'])
  })

  test('should get messages', async ({ client, assert }) => {
    const response = await client.get('/messages').bearerToken(authToken)

    response.assertStatus(200)
    assert.isArray(response.body())
  })

  test('should mark conversation as read', async ({ client }) => {
    const response = await client
      .post(`/conversations/${conversationId}/read`)
      .bearerToken(authToken)

    response.assertStatus(200)
  })

  test('should fail to access conversations without auth', async ({ client }) => {
    const response = await client.get('/conversations')

    response.assertStatus(401)
  })
})
