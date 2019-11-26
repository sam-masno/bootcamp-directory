const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, './config/config.env') })
// require('dotenv').config('./config/config.env');

//bring in models for imports
const Bootcamp = require('./models/Bootcamp.js');
const Course = require('./models/Course.js');
const User = require('./models/User.js');

// connect db
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

//create arrays from documents
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'
));
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'
));
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'
));

//import bootcamps.json into db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    console.log('bootcamps imported');
    await Course.create(courses);
    console.log('courses imported');
    await User.create(users);
    console.log('users imported');
    process.exit();
  } catch (e) {
    console.log(e);
  }
}

//delete all
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    console.log('bootcamps deleted');
    await Course.deleteMany();
    console.log('courses deleted');
    await User.deleteMany();
    console.log('users deleted');
    process.exit();
  } catch (e) {
    console.log(e)
  }
}


// define arguments
if (process.argv[2] === '-i') {
  importData();
}
if (process.argv[2] === '-d') {
  deleteData();
}
