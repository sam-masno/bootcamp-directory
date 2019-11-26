const User = require('../models/User.js');
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middleware/async.js');


//@desc   GET list of all users
//@route api/v1/auth/users
//@access Private admin
exports.getUsers= asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)

})


//@desc   GET single users
//@route api/v1/auth/users/:id
//@access Private admin
exports.getUser= asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  res.status(200).json({ success: true, data: user })

})

//@desc   create users
//@route api/v1/auth/users
//@access Private admin
exports.addUser= asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({ success: true, data: user })
})

//@desc   update users
//@route api/v1/auth/users
//@access Private admin
exports.updateUser= asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { email, name } = req.body
  const user = await User.findById(id);
  if (!user) {
    return next (
      new ErrorResponse(`User not found ID:${id}`, 404)
    )
  }
  user.email = email ? email : user.email;
  user.name = name ? name : user.name;
  await user.save({validateBeforeSave: false, new: true})
  res.status(200).json({success: true, data: user })
})

//@desc   update users
//@route api/v1/auth/users
//@access Private admin
exports.deleteUser= asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const user = await User.findById(id);
  if (!user) {
    return next (
      new ErrorResponse(`User not found ID:${id}`, 404)
    )
  }

  await user.remove();

  res.status(200).json({ success: true, message: `User ID:${id} deleted`})
})
