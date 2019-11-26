const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim : true,
    required: [true, 'Please add course title.']
  },
  description: {
    type: String,
    required: [true, 'Please add course description.']
  },
  weeks: {
    type: Number,
    required: [true, 'Please add course duration in weeks.']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tuition.']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add starting skill level.'],
    enum: [
      'beginner',
      'intermediate',
      'advanced'
    ]
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Bootcamp'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  }

})

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const avgCost = await this.aggregate([
    {
      $match: { bootcamp: bootcampId }
    },
    {
      $group : {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' }
      }
    }
  ])
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(avgCost[0].averageCost)
    })
  } catch (e) {
    console.error(e)
  }
}

CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp)
});

CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp)
})


module.exports = mongoose.model('Course', CourseSchema);
