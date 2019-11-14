const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  console.log(`Mongoose connected: ${conn.connection.host}`)
}

module.exports = connectDB;
