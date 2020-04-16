//include express and create a router
const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users_controller');

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.post('/create', usersController.createAccount);
router.post('/create-session', usersController.createSession);

//export router
module.exports = router;