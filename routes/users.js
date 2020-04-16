//include express and create a router
const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.post('/create', usersController.createAccount);
//use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
  'local',
  {failureRedirect: '/users/sign-in'}
),usersController.createSession);
router.get('/home', usersController.home);
router.get('/sign-out', usersController.destroySession);
router.post('/update-password', usersController.updatePassword);
router.get('/forgot-password', usersController.forgotPassword);
router.post('/reset-password-link', usersController.sendPasswordResetLink);
router.post('/reset-password', usersController.resetPassword);
//export router
module.exports = router;