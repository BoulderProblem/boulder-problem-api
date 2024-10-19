/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import StatsController from '#controllers/stats_controller'
import WaysController from '#controllers/ways_controller'
import WallsController from '#controllers/walls_controller'
import ZonesController from '#controllers/zones_controller'
import PlacesController from '#controllers/places_controller'
import ColorsController from '#controllers/colors_controller'
import DifficultiesController from '#controllers/difficulties_controller'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const PostsController = () => import('#controllers/posts_controller')

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
router.post('/password_lost', [AuthController, 'passwordLost'])
router.post('/reset_password', [AuthController, 'resetPassword'])
router.get('/logout', [AuthController, 'logout']).use(middleware.auth())

router
  .get('/stats', [StatsController, 'getStats'])
  .use([middleware.auth(), middleware.role(['USER'])])
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
  .get('/users/:id/avatar/:id_avatar', [UsersController, 'getAvatar'])
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
router
  .get('/places/:id', [PlacesController, 'getPlaceId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .put('/places/:id', [PlacesController, 'updatePlaceId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/places/:id/zones', [PlacesController, 'getPlaceZones'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/places/:id/favorite', [PlacesController, 'favoritePlace'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .post('/zones', [ZonesController, 'createZone'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/zones/:id', [ZonesController, 'getZoneId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .put('/zones/:id', [ZonesController, 'updateZoneId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/zones/:id/plan', [ZonesController, 'getPlan'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/zones/:id/walls', [ZonesController, 'getWallsZone'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .post('/walls/', [WallsController, 'createWall'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/walls/:id', [WallsController, 'getWallId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/walls/:id/ways', [WallsController, 'getWallWays'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .post('/ways', [WaysController, 'createWay'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/ways/:id', [WaysController, 'getWayId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .put('/ways/:id', [WaysController, 'updateWayId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .delete('/ways/:id', [WaysController, 'disableWayId'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/ways/:id/comment', [WaysController, 'createWayComment'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/ways/:id/note', [WaysController, 'createWayNote'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/ways/:id/valid', [WaysController, 'createWayValid'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .post('/ways/:id/valid', [WaysController, 'createWayValid'])
  .use([middleware.auth(), middleware.role(['USER'])])

router
  .get('/colors', [ColorsController, 'getColors'])
  .use([middleware.auth(), middleware.role(['USER'])])
router
  .get('/difficulties', [DifficultiesController, 'getDifficulties'])
  .use([middleware.auth(), middleware.role(['USER'])])
