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
import FeedController from '#controllers/feed_controller'
import UsersController from '#controllers/users_controller'
import AuthController from '#controllers/auth_controller'
import PostsController from '#controllers/posts_controller'
import ContestsController from '#controllers/contests_controller'

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
router.get('/generate', [UsersController, 'generate'])
router.post('/register', [UsersController, 'register'])
router.get('/auth/google/redirect', [AuthController, 'redirect'])
router.get('/auth/google/callback', [AuthController, 'callback'])
router.post('/login', [AuthController, 'login'])
router.post('/password_lost', [AuthController, 'passwordLost'])
router.post('/reset_password', [AuthController, 'resetPassword'])
router.get('/logout', [AuthController, 'logout']).use(middleware.auth())

router
  .get('/stats', [StatsController, 'getStats'])
  .use([middleware.auth(), middleware.role(['ADMIN'])])
router
  .get('/users', [UsersController, 'getUsers'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/user', [UsersController, 'getUser'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/users/:id', [UsersController, 'updateUserId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/users/:id', [UsersController, 'getUserId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/users/:id/avatar/:id_avatar', [UsersController, 'getAvatar'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/users/:id/follow', [UsersController, 'followUser'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .get('/posts', [PostsController, 'getPosts'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/posts', [PostsController, 'addPosts'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/posts/:id', [PostsController, 'getPostId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .patch('/posts/:id', [PostsController, 'updatePosts'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .delete('/posts/:id', [PostsController, 'deletePostId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/posts/:id/like', [PostsController, 'likePost'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/posts/:id/image/:id_image', [PostsController, 'getImage'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/posts/:id/comment', [PostsController, 'getComments'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/posts/:id/comment', [PostsController, 'createComment'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .delete('/posts/:id/comment/:id_comment', [PostsController, 'deleteComment'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .get('/feed', [FeedController, 'getFeed'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .get('/places', [PlacesController, 'places'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/places/load', [PlacesController, 'load'])
  .use([middleware.auth(), middleware.role(['ADMIN'])])
router
  .get('/places/mine', [PlacesController, 'getMine'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/places/:id', [PlacesController, 'getPlaceId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/places/:id', [PlacesController, 'updatePlaceId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/places/:id/logo', [PlacesController, 'getLogo'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/places/:id/zones', [PlacesController, 'getPlaceZones'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/places/:id/favorite', [PlacesController, 'favoritePlace'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .post('/zones', [ZonesController, 'createZone'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/zones/:id', [ZonesController, 'getZoneId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/zones/:id', [ZonesController, 'updateZoneId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .delete('/zones/:id', [ZonesController, 'deleteZoneId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/zones/:id/plan', [ZonesController, 'getPlan'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/zones/:id/walls', [ZonesController, 'getWallsZone'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .post('/walls/', [WallsController, 'createWall'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/walls/:id', [WallsController, 'getWallId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/walls/:id', [WallsController, 'updateWallId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .delete('/walls/:id', [WallsController, 'deleteWallId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/walls/:id/ways', [WallsController, 'getWallWays'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .post('/ways', [WaysController, 'createWay'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/ways/:id', [WaysController, 'getWayId'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/ways/:id', [WaysController, 'updateWayId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .delete('/ways/:id', [WaysController, 'disableWayId'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/ways/:id/comment', [WaysController, 'getWayComments'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/ways/:id/comment', [WaysController, 'createWayComment'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .delete('/ways/:id/comment/:id_comment', [WaysController, 'deleteWayComment'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/ways/:id/note', [WaysController, 'createWayNote'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/ways/:id/valid', [WaysController, 'createWayValid'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/ways/:id/valid', [WaysController, 'createWayValid'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .get('/colors', [ColorsController, 'getColors'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/difficulties', [DifficultiesController, 'getDifficulties'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])

router
  .post('/contests', [ContestsController, 'addContest'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/contests', [ContestsController, 'getContests'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/contests/mine', [ContestsController, 'getMine'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .get('/contests/:id', [ContestsController, 'getContest'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .put('/contests/:id', [ContestsController, 'updateContest'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .delete('/contests/:id', [ContestsController, 'deleteContest'])
  .use([middleware.auth(), middleware.role(['MANAGER', 'ADMIN'])])
router
  .post('/contests/:id/follow', [ContestsController, 'followContest'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/contests/:id/ways', [ContestsController, 'getContestWays'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/contests/:id/users', [ContestsController, 'getContestUsers'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .post('/contests/:id/ways/:wayId', [ContestsController, 'addWayToContest'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .delete('/contests/:id/ways/:wayId', [ContestsController, 'removeWayFromContest'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
router
  .get('/contests/:id/stats', [ContestsController, 'getContestStats'])
  .use([middleware.auth(), middleware.role(['USER', 'MANAGER', 'ADMIN'])])
