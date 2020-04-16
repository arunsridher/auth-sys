//include express and create a router
const express = require('express');
const router = express.Router();

router.use('/users', require('./users.js'));

//export router
module.exports = router;