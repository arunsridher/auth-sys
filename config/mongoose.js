//include mongoose
const mongoose = require('mongoose');

//connect to the authentication system database
mongoose.connect("mongodb://localhost/auth-sys");

//check if connected to the database
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error'));
db.once('open', function(){
  // if connected
  console.log("Successfully connected to the database");
})

//export the database
module.exports = db;
