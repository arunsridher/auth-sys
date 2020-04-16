//include express and create a router
const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users_controller');

router.get('/sign-up', usersController.signUp);

//export router
module.exports = router;