const Bootcamp = require('../models/Bootcamp.js');
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middleware/async.js');

//@desc   get all bootcamps
//@route  GET /api/v1/bootcamps
//@acces Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res.status(200).json({ success: true, count : bootcamps.length, bootcamps})
})

//@desc   get one bootcamp
//@route  GET /api/v1/bootcamps/:id
//@acces Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse('Bootcamp not found.', 404));
  }
  res.status(200).json({success: true, data: bootcamp})
})

//@desc    add bootcamp
//@route   POST /api/v1/bootcamps/:id
//@acces   Private
exports.postBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({success: true, data: bootcamp})
});

//@desc   update a bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const update = await Bootcamp.findByIdAndUpdate(id, req.body, { new: true });
  if (!update) {
    return res.status(404).json({success: false, message: 'Bootcamp not found'})
  }
  res.status(200).json({ success: true, data: update})

})


//@desc   delete a bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findByIdAndRemove(id);
  if(!bootcamp) {
    res.status(404).json({success: false, message: 'Bootcamp not found'})
  }
  res.status(200).json({ success: true, message: 'Bootcamp deleted' })
})
