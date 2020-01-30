const Review = require('../models/Review.js');
const Bootcamp = require('../models/Bootcamp.js');
const ErrorResponse = require('../utils/errorResponse.js');
const asyncHandler = require('../middleware/async.js');

// @desc    get all reviews or by bootcamp
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public
module.exports.getReviews = asyncHandler(async (req, res, next) => {
  console.log(req.params)
  if (req.params.bootcampId) {
    const courses = await Review.find({bootcamp: req.params.bootcampId});
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      message: 'single'
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

// @desc    get single review
// @route   GET /api/v1/reviews/:id
//@access   Public
exports.getReview = asyncHandler(async(req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path:'bootcamp',
    select: 'name description'
  });
  if (!review){
    return next(
      new ErrorResponse(`Review ID${req.params.id} not found`, 404)
    )
  }
  res.status(200).json({success: true, data: review})
})

// @desc    add a review for bootcamp
// @route   POST /api/v1/bootcamps/:bootcampId/reviews/
//@access   Private users admins
exports.addReview = asyncHandler(async(req, res, next) => {
  // ensure bootcamp id is included
  const { bootcampId } = req.params;
  const { user } = req;
  //check for bootcampId
  if(!req.params.bootcampId) {
    return next(
      new ErrorResponse('Please include bootcamp ID in request url', 400)
    )
  }
  // check if bootcamp exists
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if(!bootcamp){
    return next(
      new ErrorResponse(`Bootcamp not found ID:${req.params.bootcampId}`, 404)
    )
  }
  //check if user has previously reviewed this bootcamp
  const previousReview = await Review.findOne({ $and:[{bootcamp: bootcampId}, {user: user} ]})
  if(previousReview){
    return next(
      new ErrorResponse('You have previously reviewed this bootcamp', 401)
    )
  }
  // add relation properties to req
  req.body.bootcamp = bootcampId;
  req.body.user = user.id;
  //create review and return
  const review = await Review.create(req.body);
  res.status(201).json({success: true, data: review})
})

// @desc    edit a review
// @route   GET /api/v1/reviews/:id
//@access   Private users admins
exports.editReview = asyncHandler(async(req, res, next) => {
  // deconstruct necessary properties
  const { title, rating, text } = req.body
  const { id } = req.params;
  //check for review and if owner or admin
  const review = await Review.findById(id);
  if(!review){
    return next(
      new ErrorResponse('Review not found', 404)
    )
  }
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to edit this review.', 401)
    )
  }
  // update properties if present
  review.title = title ? title : review.title;
  review.rating = rating ? rating : review.rating;
  review.text = text ? text : review.text;

  //save and return
  await review.save({ validateBeforeSave: true, new: true });
  res.status(201).json({success: true, data: review })

})

// @desc    delete a review
// @route   DELETE /api/v1/reviews/:id
//@access   Private user admin
exports.deleteReview = asyncHandler(async(req, res, next) => {
  const { id } = req.params;
  //check for review
  const review = await Review.findById(id);
  if(!review){
    return next(
      new ErrorResponse('Review not found', 404)
    )
  }
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to edit this review.', 401)
    )
  }

  review.remove();
  res.status(200).json({ success: true, message: 'Review deleted'})

})


// @desc    get reviews by userId
// @route   GET /api/v1/users/:userId/reviews
//@access   Public
//not employed atm
exports.reviewsByUser = asyncHandler(async(req, res, next) => {
  const { id } = req.params;
  const reviews = await Review.find({ user: id })
  console.log(id)
  res.status(200).json({success: true, data: reviews})
})
