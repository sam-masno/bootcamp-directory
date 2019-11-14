const express = require('express');
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  postBootcamp
} = require('../controllers/bootcamp.js');


//get all bootcamps
router.get('/',(req, res, next) => {
  getBootcamps(req, res, next)
})


//get a single bootcamp
router.get('/:id',(req, res, next) => {
  getBootcamp(req, res, next)
})

//creat a bootcamp
router.post('/',(req, res, next) => {
  postBootcamp(req, res, next)
})

router.put('/:id',(req, res, next) => {
  updateBootcamp(req, res, next)
});

router.delete('/:id',(req, res, next) => {
  deleteBootcamp(req, res, next)
})

module.exports = router;
