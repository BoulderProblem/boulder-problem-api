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
import PostsController from '#controllers/posts_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/register', [UsersController, 'register'])
router.post('/login', [AuthController, 'login'])
router.get('/logout', [AuthController, 'logout']).use(middleware.auth())

router
  .get('/users', [UsersController, 'GetUsers'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .patch('/users/:id', [UsersController, 'updateUserId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/users/:id', [UsersController, 'GetUserId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/users/:id/follow', [UsersController, 'followUser'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .get('/posts', [PostsController, 'getPosts'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/posts', [PostsController, 'addPosts'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/posts/:id', [PostsController, 'getPostId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .patch('/posts/:id', [PostsController, 'updatePosts'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .delete('/posts/:id', [PostsController, 'deletePostId'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .post('/posts/:id/like', [PostsController, 'likePost'])
  .use([middleware.auth(), middleware.role(['USER'])])

router.get('/image/:name', async ({ request, response }) => {
  const image = fs.createReadStream('./files/user_image/' + request.params().name)
  response.stream(image)
})
