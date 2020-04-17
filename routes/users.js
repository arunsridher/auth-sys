//include express and create a router
const express = require('express');
const router = express.Router();

//include request library -> for recaptcha
const request = require('request');

//recaptcha libraries
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const recaptcha = new Recaptcha(env.site_key, env.secret_key);

//passport to authenticate user during login
const passport = require('passport');

const env = require('../config/environment');
const usersController = require('../controllers/users_controller');

//middleware to verify recaptcha
verifyCaptcha = function(req, res, next){
  //if req body is empty or null
  if(req.body === undefined || req.body === '' || req.body === null)
  {
      console.log("req.body ", req.body);
      req.flash('error','reCAPTCHA Incorrect');
      return res.redirect('back');
  }

  //secret key
  const secretKey = env.secret_key;

  //verification URL
  const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body.captcha + "&remoteip=" + req.connection.remoteAddress;

  //check if captcha is valid
  request(verificationURL,function(error, response, body) {
    body = JSON.parse(body);
    //If not succesful
    if(body.success !== undefined && !body.success) {
      console.log("responseError Failed captcha verification");
      req.flash('error','Failed captcha verification');
      return res.redirect('back');
    }
    console.log("responseSuccess Sucess");
    next();
  });
}

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.get('/sign-out', usersController.destroySession);
router.get('/activate-account', usersController.activateAccount)
router.get('/reset-password', usersController.resetPassword);
router.get('/home', usersController.home);

//use recaptcha as a middleware to authenticate
router.post('/create', recaptcha.middleware.verify = verifyCaptcha, usersController.createAccount);

//use recaptcha and passport as a middleware to authenticate
router.post('/createSession',recaptcha.middleware.verify = verifyCaptcha, passport.authenticate(
  'local',
  {failureRedirect: '/users/sign-in'}
),usersController.createSession);

router.post('/update-password', usersController.updatePassword);
router.get('/forgot-password', usersController.forgotPassword);
router.post('/create-password-reset-req', usersController.createPasswordResetReq);
router.post('/create-new-password', usersController.createNewPassword);

//export router
module.exports = router;
