const crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config/config.env') });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter name.'],
    minLength: 5
  },
  email: {
    type: String,
    required: [true, 'Please add a valid email address.'],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email address.'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please include a password'],
    minLength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Encrypt password with bcryptjs
UserSchema.pre('save', async function(next) {
  if(!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next()
})

//return a signed token with user id
UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// compare challenge with users password
UserSchema.methods.matchPassword = async function (plainText) {
  return await bcrypt.compare(plainText, this.password)
}

// set and send reset token
UserSchema.methods.getResetToken = function () {
  let resetToken = crypto.randomBytes(20).toString('hex');

  // create hash
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    //set expiration
  // resetToken = this.resetPasswordToken;
  this.resetPasswordDate = Date.now() + 10 * 60 * 1000

  return resetToken
}

//remove bootcamps and then courses belonging to user
UserSchema.pre('remove', async function (next) {
  await this.model('Bootcamp').deleteMany({ user: this._id});
  next();
})

//set reverse virtual, gets items that include localField
//set name of virtual
//give schema name to be searched, this.property to identify, which field to check, get all that match
UserSchema.virtual('bootcamps', {
  ref: 'Bootcamp',
  localField: '_id',
  foreignField: 'user',
  justOne: false
})

//set reverse virtual, gets items that include localField
//set name of virtual
//give schema name to be searched, this.property to identify, which field to check, get all that match
UserSchema.virtual('reviews', {
  ref: 'Review',
  localField: 'id',
  foreignField: 'user',
  justOne: false
})

module.exports = mongoose.model('User', UserSchema)
