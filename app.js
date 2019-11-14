const express = require('express');
const dotenv = require('dotenv');
// const logger = require('./middleware/logger.js');
const bootcamps = require('./routes/bootcamps.js');
const morgan = require('morgan');
const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/error.js');

//load env vars
dotenv.config({path: './config/config.env'})

//init server object and connect db
const app = express();
connectDB();

//http logger
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//apply body parser
app.use(express.json())

//direct routes
app.use('/api/v1/bootcamps', bootcamps);
// app.use('/api/v1/admin', bootcamps);
// app.use('/api/v1/user', bootcamps);

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
