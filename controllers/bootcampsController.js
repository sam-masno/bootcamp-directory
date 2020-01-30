const Bootcamp = require('../models/Bootcamp.js');
const Review = require('../models/Review.js');
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middleware/async.js');
const geocoder = require('../utils/geocoder.js');
const getGeoCode = require('../utils/getGeoCode.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/config.env') });

//@desc   get all bootcamps
//@route  GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
//add user field to body to make relationship with bootcamp and user
  req.body.user = req.user.id

//check if user already published a bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

//kick back if user is not admin and already published bootcamp
  if(publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`A bootcamp already exists by user ID:${req.user._id}.`, 401)
    )
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({success: true, data: bootcamp})
});

//@desc   update a bootcamp
//@route  PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let bootcamp = await Bootcamp.findById(id);
  //check user is bootcamp owner
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found ID:${id}.`, 404)
    )
  }

  //verify user is owner of this bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {new: true, runValidators: true })

  res.status(200).json({ success: true, data: bootcamp })

})


//@desc   delete a bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);
  if(!bootcamp) {
    return res.status(404).json({success: false, message: 'Bootcamp not found'})
  }

  //check if user published it
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  await bootcamp.remove();
  await Review.deleteMany({ bootcamp: id })

  res.status(200).json({ success: true, message: 'Bootcamp deleted' })
})

//@desc   get bootcamps with a radius
//@route  GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access Public
exports.searchRadius = asyncHandler(async (req, res, next) => {
  //pull zip and dist form params
  // v1
  // const { zipcode, distance } = req.params;

  //v2
  const { lat, lng, distance } = req.params;

  // v1
  // get lat and long from
  // const loc = await geocoder.geocode(zipcode);
  // const lat = loc[0].latitude;
  // const long = loc[0].longitude;

  //divide distance by radius of earth
  const radius = distance / 3958.8;
  //make mongo query
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
  })

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  })
})

//@desc   upload photo to bootcamp
//@route  PUT /api/v1/bootcamps/:id/photo
//@access Private
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);

  //check bootcamp exists
  if(!bootcamp) {
    const err = new ErrorResponse(`Bootcamp not found ID: ${id}`, 404);
    return next(err)
  }

  // check user has authority
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse('You are not authorized to alter this resource.', 401)
    )
  }

  //check files included
  if(!req.files){
    const err = new ErrorResponse(`Please upload a file.`, 400);
    return next(err)
  }

  // extract file and test if photo
  const { file } = req.files;
  if(!file.mimetype.startsWith('image')){
    return next(
      new ErrorResponse('Please uplad an image file.', 400)
    )
  }

  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload image smaller than ${process.env.MAX_FILE_UPLOAD}`, 400)
    )
  }

  //assign unique name to file;
  file.name = `photo_${id}${path.parse(file.name).ext}`

  //move file to uploads folder;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(
        new ErrorResponse(`Please upload image smaller than ${process.env.MAX_FILE_UPLOAD}`, 400)
      )
    }

    await Bootcamp.findByIdAndUpdate(id, { photo: file.name })

    res.status(200).json({ success: true, message: 'Photo uploaded.' })

  })
})

//@desc   get geocode for location entered by user
//@route  GET /api/v1/bootcamps/search
//@access Private
exports.getGeocode = asyncHandler( async ( req,res,next ) => {
  const { address } = req.params;
  const location = await getGeoCode(address);
  const {success, lat, lng} = location;
  if(success) {
    res.status(200).json({ success, lat, lng})
  } else {
    res.status(404).json({ success, lat, lng })
  }
})
