const express = require('express');
const router = express.Router();
const reviewsRouter = require('./reviews')

//models
const User = require('../models/User.js');

//controllers
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser
} = require('../controllers/userController.js');

//middlewares
const advancedResults = require('../middleware/advancedResults.js');
const {
  protect,
  authorize
} = require('../middleware/auth.js');

//route for reviews by user
router.use('/:userId/reviews', reviewsRouter)

//protect and authorize admin all below routes
router.use(protect);
router.use(authorize('admin'))

//all users
router.route('/')
  .get(advancedResults(User, 'bootcamps'), getUsers)
  .post(addUser)

//singe user
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)
module.exports = router
