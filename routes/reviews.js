const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/Review.js');
const {
  getReviews,
  getReview,
  addReview,
  editReview,
  deleteReview } = require('../controllers/reviewsController.js');
const advancedResults = require('../middleware/advancedResults.js');
const {
  protect,
  authorize
} = require('../middleware/auth.js');

//all reviews route
router.route('/')
  .get(advancedResults(Review,{
    path:'bootcamp',
    select:'name description'
  }), getReviews)
  .post(protect, authorize('user', 'admin'), addReview)
// get reviews for single bootcamp
// router.route('')
//   .get(getBootcampReviews)

router.get('/:id', getReview)

//review by id route
router.use(protect);
router.use(authorize('user', 'admin'))
router.route('/:id')
  .put(editReview)
  .delete(deleteReview)

module.exports = router
