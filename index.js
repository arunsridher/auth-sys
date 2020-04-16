//include express
const express = require('express');

//include express layouts
const expressLayouts = require('express-ejs-layouts');

//port on which the server should listen
const port = 8000;

//include path module
const path = require('path');

//include database
const db = require('./config/mongoose');

//create express application
const app = express();

//middleware to parse form data
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//set assets path
app.use(express.static('./assets'));

//set view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './views');

//use express layouts
app.use(expressLayouts);

//redirect all urls to routes index.js
app.use('/', require('./routes'));

//start the express on specefied port
app.listen(port, function(err){
  if(err){
    console.log(`Error in starting the server: ${err}`);
    return;
  }
  console.log(`Server up and running on port: ${port}`);
})