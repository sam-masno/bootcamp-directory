const express = require('express');
const router = express.Router();
const Bootcamp = require('../models/Bootcamp.js');
const advancedResults = require('../middleware/advancedResults.js');
const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  postBootcamp,
  searchRadius,
  uploadPhoto
} = require('../controllers/bootcampsController.js');
const { protect, authorize } = require('../middleware/auth.js');

//routers for redirecting to other areas
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');

//redirect to courses
router.use('/:bootcampId/courses', courseRouter)

//redirect to reviews
router.use('/:bootcampId/reviews', reviewsRouter)


router.route('/')
.get(advancedResults(Bootcamp, 'courses'),getBootcamps)
.post(protect, authorize('publisher', 'admin'), postBootcamp)


//get a single bootcamp
router.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

//search bootcamps by zipcode and distance
router.route('/radius/:zipcode/:distance')
.get(searchRadius)

//upload Photo
router.route('/:id/photo')
.put(protect, authorize('publisher', 'admin'), uploadPhoto)


module.exports = router;
