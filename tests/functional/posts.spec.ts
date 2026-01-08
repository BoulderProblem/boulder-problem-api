import { test } from '@japa/runner'
import { createWriteStream } from 'fs'
import { join } from 'path'

test.group('Posts', (group) => {
  let authToken: string
  let postId: number
  let testImagePath: string

  group.setup(async () => {
    // Créer une image de test (1x1 pixel PNG)
    testImagePath = join(process.cwd(), 'tmp', 'test-image.png')
    const pngData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    // Créer le dossier tmp s'il n'existe pas
    const fs = await import('fs')
    if (!fs.existsSync(join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(join(process.cwd(), 'tmp'), { recursive: true })
    }

    const stream = createWriteStream(testImagePath)
    stream.write(pngData)
    stream.end()
  })

  group.each.setup(async ({ context }) => {
    if (!authToken) {
      // Create and login user
      const email = `posts-test-${Date.now()}@example.com`
      await context.client.post('/register').json({
        firstname: 'Post',
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

  // test('should create a post with images', async ({ client, assert }) => {
  //   const response = await client
  //     .post('/posts')
  //     .bearerToken(authToken)
  //     .fields({
  //       title: 'Test Post with Image',
  //       text: 'This is a test post with an image',
  //     })
  //     .file('images', testImagePath)

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.properties(body, ['id', 'title', 'text', 'image', 'userId'])
  //   assert.equal(body.title, 'Test Post with Image')
  //   assert.equal(body.text, 'This is a test post with an image')
  //   assert.isArray(body.image)
  //   assert.equal(body.image.length, 1)

  //   postId = body.id
  // })

  // test('should create a post with multiple images', async ({ client, assert }) => {
  //   const response = await client
  //     .post('/posts')
  //     .bearerToken(authToken)
  //     .fields({
  //       title: 'Test Post with Multiple Images',
  //       text: 'This post has multiple images',
  //     })
  //     .file('images', testImagePath)
  //     .file('images', testImagePath)

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.isArray(body.image)
  //   assert.equal(body.image.length, 2)
  // })

  // test('should get a specific post', async ({ client, assert }) => {
  //   // Retrieve post
  //   const response = await client.get(`/posts/${postId}`).bearerToken(authToken)

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.isArray(body)
  //   assert.isAbove(body.length, 0)
  //   assert.equal(body[0].id, postId)
  //   assert.properties(body[0], ['id', 'title', 'text', 'user'])
  // })

  // test('should update a post', async ({ client, assert }) => {
  //   // Update it
  //   const response = await client.patch(`/posts/${postId}`).bearerToken(authToken).json({
  //     title: 'Updated Title',
  //     text: 'Updated text',
  //   })

  //   response.assertStatus(200)
  //   const body = response.body()
  //   assert.equal(body.title, 'Updated Title')
  //   assert.equal(body.text, 'Updated text')
  // })

  // test('should like a post', async ({ client, assert }) => {
  //   // Like it
  //   const response = await client.post(`/posts/${postId}/like`).bearerToken(authToken).json({
  //     like: true,
  //   })

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.equal(body.isLike, true)
  // })

  // test('should unlike a post', async ({ client, assert }) => {
  //   // Like it first
  //   await client.post(`/posts/${postId}/like`).bearerToken(authToken).json({
  //     like: true,
  //   })

  //   // Then unlike it
  //   const response = await client.post(`/posts/${postId}/like`).bearerToken(authToken).json({
  //     like: false,
  //   })

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.equal(body.isLike, false)
  // })

  // test('should get post comments', async ({ client, assert }) => {
  //   // Get comments (should be empty)
  //   const response = await client.get(`/posts/${postId}/comments`).bearerToken(authToken)

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.isArray(body.data)
  // })

  // test('should create a comment on a post', async ({ client, assert }) => {
  //   // Create a comment
  //   const response = await client.post(`/posts/${postId}/comments`).bearerToken(authToken).json({
  //     text: 'This is a test comment',
  //   })

  //   response.assertStatus(200)
  //   const body = response.body()

  //   assert.properties(body, ['id', 'text', 'userId', 'postId'])
  //   assert.equal(body.text, 'This is a test comment')
  //   assert.equal(body.postId, postId)
  // })

  // test('should delete a comment', async ({ client }) => {
  //   // Create a comment
  //   const commentResponse = await client
  //     .post(`/posts/${postId}/comments`)
  //     .bearerToken(authToken)
  //     .json({
  //       text: 'Comment to delete',
  //     })

  //   const commentId = commentResponse.body().id

  //   // Delete the comment
  //   const response = await client
  //     .delete(`/posts/${postId}/comments/${commentId}`)
  //     .bearerToken(authToken)

  //   response.assertStatus(200)
  // })

  // test('should delete a post', async ({ client }) => {
  //   // Delete it
  //   const response = await client.delete(`/posts/${postId}`).bearerToken(authToken)

  //   response.assertStatus(200)
  //   response.assertBodyContains({ success: true })
  // })

  // test('should fail to delete post from another user', async ({ client }) => {
  //   // Create another user
  //   const email2 = `posts-test-other-${Date.now()}@example.com`
  //   await client.post('/register').json({
  //     firstname: 'Other',
  //     lastname: 'User',
  //     email: email2,
  //     password: 'password123',
  //     birth_date: '1995/06/28',
  //     genderId: 1,
  //   })

  //   const loginResponse2 = await client.post('/login').json({
  //     email: email2,
  //     password: 'password123',
  //   })

  //   const authToken2 = loginResponse2.body().token

  //   // First user creates a post
  //   const createResponse = await client
  //     .post('/posts')
  //     .bearerToken(authToken)
  //     .fields({
  //       title: 'Post from User 1',
  //       text: 'Test content',
  //     })
  //     .file('images', testImagePath)

  //   const createdPostId = createResponse.body().id

  //   // Second user tries to delete it
  //   const response = await client.delete(`/posts/${createdPostId}`).bearerToken(authToken2)

  //   response.assertStatus(401)
  // })

  // test('should get post image', async ({ client, assert }) => {
  //   // First create a post with image
  //   const createResponse = await client
  //     .post('/posts')
  //     .bearerToken(authToken)
  //     .fields({
  //       title: 'Post with Image to Retrieve',
  //       text: 'Test content',
  //     })
  //     .file('images', testImagePath)

  //   const post = createResponse.body()
  //   const imageName = post.image[0]

  //   // Get the image
  //   const response = await client
  //     .get(`/posts/${post.id}/images/${imageName}`)
  //     .bearerToken(authToken)

  //   response.assertStatus(200)
  //   // Vérifier que c'est bien une image (content-type)
  //   assert.exists(response.headers()['content-type'])
  // })

  // test('should fail to get image with wrong name', async ({ client }) => {
  //   // First create a post
  //   const createResponse = await client
  //     .post('/posts')
  //     .bearerToken(authToken)
  //     .fields({
  //       title: 'Post for Wrong Image Test',
  //       text: 'Test content',
  //     })
  //     .file('images', testImagePath)

  //   const post = createResponse.body()

  //   // Try to get image with wrong name
  //   const response = await client
  //     .get(`/posts/${post.id}/images/wrong-image-name.png`)
  //     .bearerToken(authToken)

  //   response.assertStatus(422)
  // })

  // test('should fail to create post without auth', async ({ client }) => {
  //   const response = await client
  //     .post('/posts')
  //     .fields({
  //       title: 'Unauthorized Post',
  //       text: 'Should fail',
  //     })
  //     .file('images', testImagePath)

  //   response.assertStatus(401)
  // })

  // test('Create post without images', async ({ client }) => {
  //   const response = await client.post('/posts').bearerToken(authToken).json({
  //     title: 'Post without Images',
  //     text: 'This should fail',
  //   })

  //   response.assertStatus(200)
  // })
})
