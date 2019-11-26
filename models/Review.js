const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    trim: true,
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add a message']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please a rating of 1 through 10']
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})

ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const avgCost = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group : {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' }
      }
    }
  ])
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: Math.ceil(avgCost[0].averageRating)
    })
  } catch (e) {
    console.error(e)
  }
}

// convert to review Schema
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp)
});

ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp)
})

module.exports = mongoose.model('review', ReviewSchema)
