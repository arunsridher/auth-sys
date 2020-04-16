const express = require('express');
const port = 8000;
const app = express();

//start the express on specefied port
app.listen(port, function(err){
  if(err){
    console.log(`Error in starting the server: ${err}`);
    return;
  }
  console.log(`Server up and running on port: ${port}`);
})