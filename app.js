const express = require('express');
const dotenv = require('dotenv');

//routers
const bootcamps = require('./routes/bootcamps.js');
const courses = require('./routes/courses.js');
const users = require('./routes/user.js');
const auth = require('./routes/auth.js');
const reviews = require('./routes/reviews.js');

//middlewares
const morgan = require('morgan');
const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/error.js');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const sanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//load env vars
dotenv.config({path: './config/config.env'})

//init server object and connect db
const app = express();
connectDB();

//http logger
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//apply body parser middleware
app.use(express.json());

//apply security middlewares
app.use(helmet());//headers for security
app.use(xss());//cross site scripting
app.use(sanitizer());//nosql injections
app.use(hpp());//http pollution
app.use(cors());//cross origin scripting

//init limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
})
app.use(limiter)

//apply to receive cookies
app.use(cookieParser());

//express file uploader middleware
app.use(fileupload());

//serve static public folder
app.use(express.static(path.join(__dirname, 'public')))

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/users', users);


//insert cust error middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`
  ));

// handle unhandled promise rejections
process.on('unhandledRejection', ( err, promise ) => {
  console.log(`Error: ${err.message}`);
  //close server and exit process
  server.close(() => process.exit(1));
})
