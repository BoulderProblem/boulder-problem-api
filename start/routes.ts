/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import fs from 'fs'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])
router.get('/logout', [AuthController, 'logout']).use(middleware.auth())

router.get('/users', [UsersController, 'GetUsers']).use([
  middleware.auth({
    guards: ['api'],
  }),
  middleware.role(['USER']),
])
router.patch('/users', [UsersController, 'updateUsers']).use([
  middleware.auth({
    guards: ['api'],
  }),
  middleware.role(['USER']),
])
router.get('/users/:id', [UsersController, 'GetUserId']).use([
  middleware.auth({
    guards: ['api'],
  }),
  middleware.role(['USER']),
])

// router.get('/posts', 'PostsController.getPosts').middleware(['auth', 'role:user'])
// router.post('/posts', 'PostsController.addPosts').middleware(['auth', 'role:user'])
// router.patch('/posts', 'PostsController.updatePosts').middleware(['auth', 'role:user'])
// router.get('/posts/:id', 'PostsController.getPostId').middleware(['auth', 'role:user'])

// router.post('/posts/:id/like', 'PostsController.likePost').middleware(['auth', 'role:user'])

router.get('/image/:name', async ({ request, response }) => {
  const image = fs.createReadStream('./files/user_image/' + request.params().name)
  response.stream(image)
})
