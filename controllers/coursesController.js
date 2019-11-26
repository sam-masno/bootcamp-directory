const Course = require('../models/Course.js');
const Bootcamp = require('../models/Bootcamp.js');
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middleware/async.js');

// @desc    get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcamp/courses
//@access   Public
module.exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({bootcamp: req.params.bootcampId});
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})


// @desc    get one course
// @route   GET /api/v1/courses
//@access   Public
module.exports.getCourse = asyncHandler(async (req, res, next) => {

  const { id } = req.params;

  //check for bootcamp param
  const course = await Course.findById(id).populate({path: 'bootcamp', select: 'name description'});
  //check course exists
  if(!course) {
    const err = new ErrorResponse(`Course not found ID: ${id}`, 404);
    return next(err)
  }
  //return to client
  res.json({
    success: true,
    data: course
  })
})

// @desc    add a course
// @route   POST /api/v1/bootcamps/:bootcamp/courses
//@access   Private

module.exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if(!bootcamp) {
    const err = new ErrorResponse(`Bootcamp not found ID:${req.params.bootcampID}`, 404);
    return next(err);
  }

  //authorize user
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  const course = await Course.create(req.body);
  //check for bootcamp param

  //return to client
  res.json({
    success: true,
    data: course
  })
})

// @desc    delete a course
// @route   DELETE /api/v1/courses/:id
//@access   Private

module.exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);

  //check that course exists
  if (!course){
    const err = new ErrorResponse(`Course not found ID:${id}`, 404);
    return next(err);
  }

  // authorize user
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  await course.remove();
  //return to clientCourse
  res.json({
    success: true,
    message: 'Course deleted.'
  })
})


// @desc    UPDATE a course
// @route   PUT /api/v1/courses/:id
//@access   Private
module.exports.updateCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  let course = await Course.findById(id);

  // check course exists
  if(!course){
    const err = new ErrorResponse(`Course not found ID:${id}`, 404);
    return next(err);
  }

  // authorize user
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  //return to client
  course = await Course.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  res.json({
    success: true,
    data: course
  })
})
