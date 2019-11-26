const express = require('express');
const router = express.Router();

//controllers
const {
  register,
  login,
  getMe,
  resetPasswordToken,
  resetPassword,
  updateDetails,
  changePassword,
  logout
} = require('../controllers/authController')

//middleware
const {
  protect,
  authorize
} = require('../middleware/auth.js');

const advancedResults = require('../middleware/advancedResults.js');

//register new user and return token
router.route('/register')
  .post(register)

// login in users
router.route('/login')
  .post(login)

//get current logged in user
router.route('/me')
  .get(protect, getMe)

//get reset password token
router.route('/forgotPassword')
  .post(resetPasswordToken)

//use reset pass token to update password
router.route('/resetPassword/:resettoken')
  .put(resetPassword)

//update details
router.route('/updatedetails')
  .put(protect, updateDetails)

//update details
router.route('/changepassword')
  .put(protect, changePassword)

router.get('/logout', logout)

module.exports = router
