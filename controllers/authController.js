const User = require('../models/User.js');
const ErrorResponse = require('../utils/errorResponse.js')
const asyncHandler = require('../middleware/async.js');
const sendEmail = require('../utils/emailer.js');
const crypto = require('crypto');

//@desc   POST register a User
//@route api/v1/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create new User
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  sendTokenResponse(user, 200, res);

})

//@desc  POST Login a User
//@route api/v1/auth/login
//@access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password){
    return next(
      new ErrorResponse('Please enter email and password.', 400)
    )
  }

  // check user exists in db and create object
  const user = await User.findOne({ email }).select('+password');

  if(!user){
    return next(
      new ErrorResponse('Email not found.', 401)
    )
  }

  const match = await user.matchPassword(password)

  if (!match) {
    return next(
      new ErrorResponse('Incorrect password.', 401)
    )
  }

  sendTokenResponse(user, 200, res);

})


// @desc Get logged in User
//@route api/v1/auth/me
//@Access private
exports.getMe = asyncHandler(async(req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    sucess: true,
    data: user
  })
})

// @desc get password reset token
//@route api/v1/auth/forgotPassword
//@Access public
exports.resetPasswordToken = asyncHandler(async(req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  // console.log(req)
  if(!user){
    return next(
      new ErrorResponse('Email was not found', 404)
    )
  }

  //get reset token from model
  const resetToken = user.getResetToken();

  //save user
  await user.save({ validateBeforeSave: false });

  //construct reset url for email reset
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`

  const message = `Make put request to the following url with password in the body ${resetUrl}`

  try {
    await sendEmail({
     email: user.email,
     subject: `Reset password at ${req.get('host')}`,
     message
   })

   res.status(200).json({
     sucess: true,
     resetToken
   })

  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordDate = undefined;
    await user.save({ validateBeforeSave: false })
    console.log(e.message)
    return next(
      new ErrorResponse('There was an error. Please try again.', 500)
    )
  }
})

// @desc reset Password
//@route api/v1/auth/resetPassword
//@Access public
exports.resetPassword = asyncHandler(async(req, res, next) => {
  const resetToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
  const { password } = req.body;
  //find user
  const user = await User.findOne({
    resetPasswordToken: resetToken,
    resetPasswordDate: { $gte: Date.now()}
  });

  //throw error if no user
  if(!user) {
    return next(
      new ErrorResponse(`Invalid token #${req.params.resetToken}`, 404)
    )
  }

  //check for password
  if(!password) {
    return next(
      new ErrorResponse('Please enter new password')
    )
  }

  //set new password and save
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordDate = undefined;



  //save changes
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res)
})

// @desc update name and email for user
//@route api/v1/auth/updateDetails
//@Access private
exports.updateDetails = asyncHandler(async(req, res, next) => {
  const { name, email } = req.body

  //declare update object and add fields if present
  let fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if(email) fieldsToUpdate.email = email;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    runValidators: false,
    new: true
  });

  res.status(200).json({
    sucess: true,
    user
  })
})

// @desc change password
//@route api/v1/auth/changepassword
//@Access private
exports.changePassword = asyncHandler(async(req, res, next) => {
  const { password, newPassword } = req.body;
  let user = await User.findById(req.user.id).select('+password');
  //compare old passwords
  const match = await user.matchPassword(password);
  if(!match){
    return next(
      new ErrorResponse('Incorrect Password', 401)
    )
  }
  // update password and get new token
  user.password = newPassword;

  //save user and return token
  await user.save({ validateBeforeSave: false })
  sendTokenResponse(user, 200, res);
})

// @desc Log user out and clear cookie
//@route api/v1/auth/logout
//@Access private
exports.logout = asyncHandler(async(req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json()
})


//make cookie response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwt();

//for cookie
  // const options = {
  //   expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
  //   httpOnly: true
  // }

  //check if in dev or production and set cookies to https
  if(process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  //not for cookie
  res.status(statusCode).json({success: true, token})

  //send cookie
  // res.status(statusCode).cookie('token', token, options).json({success: true, token})
}
