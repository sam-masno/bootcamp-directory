const asyncHandler = require('./async.js');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse.js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/config.env') });

//Protect a route
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  if(!token){
    return next(
      new ErrorResponse('Not authorized to access this resource.', 401)
    )
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    req.user = await User.findById(decoded.id);
    next()
  } catch (e) {
    return next(
      new ErrorResponse('Not authorized to access this resource.', 401)
    )
  }
})

//Authorize access based on user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to utilize this resource.`, 401)
      )
    }
    next()
  }
}
