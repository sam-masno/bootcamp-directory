const ErrorResponse = require('../utils/errorResponse.js');

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message
  console.log(err)

  //Mongoose bad object
  if (err.name === "CastError") {
    const message = `Resource not found: ID${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // check for validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }

  //check for duplicate by error code
  if (error.code === 11000) {
    const message = `Duplicate field value entered ${error.value}`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server error.'
  })
  next()
}


module.exports = errorHandler;
