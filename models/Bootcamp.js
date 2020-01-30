const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder.js');

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add bootcamp name'],
    unique: true,
    trim: true,
    maxlength: [55, 'Name must be less than 55 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description must be under 500 characters'],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please enter a valid url.'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number must be less than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email.'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    //Geojson point
    type: {
      type: String,
      enum: ['Point'],
      // required: true
    },
    coordinates: {
      type: [Number],
      // required: true,
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must be 10 or less']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

//create bootcamp slug from name
BootcampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true, replacement: '-' })
  // console.log(this.slug)
  next();
})

BootcampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [ loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    country: loc[0].countryCode,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode
  }
  next()
})

//set reverse virtual, gets items that include localField
//set name of virtual
//give schema name to be searched, this.property to identify, which field to check, get all that match
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
})

//delete course of this bootcamp on removal
BootcampSchema.pre('remove', async function (next) {
  await this.model('Course').deleteMany({ bootcamp: this._id});
  next();
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)
