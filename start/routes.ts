/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import fs from 'fs'
import { middleware } from './kernel.js'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import mail from '@adonisjs/mail/services/main'
import { HttpContext } from '@adonisjs/core/http'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const PostsController = () => import('#controllers/posts_controller')
const PlacesController = () => import('#controllers/places_controller')

// returns swagger in YAML
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.post('/register', [UsersController, 'register'])
router.post('/login', [AuthController, 'login'])
router.get('/logout', [AuthController, 'logout']).use(middleware.auth())

router
  .get('/users', [UsersController, 'getUsers'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/user', [UsersController, 'getUser'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .patch('/users/:id', [UsersController, 'updateUserId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/users/:id', [UsersController, 'getUserId'])
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
router
  .get('/posts/:id/image/:id_image', [PostsController, 'getImage'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .post('/posts/:id/comment', [PostsController, 'createComment'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .get('/places', [PlacesController, 'places'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .get('/places/load', [PlacesController, 'load'])
  .use([middleware.auth(), middleware.role(['USER'])])

router.get('/image/:name', async ({ request, response }: HttpContext) => {
  // await mail.send((message) => {
  //   message
  //     .to('alexandrechabane72@gmail.com')
  //     .from('boulder_problem@chabs.fr')
  //     .subject('Verify your email address')
  //     .htmlView('emails/email_1', { title: 'Boulder Problem' })
  // })

  const image = fs.createReadStream('./files/user_image/' + request.params().name)
  response.stream(image)
})
