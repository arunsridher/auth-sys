//include required models
const User = require('../models/user');
const ResetPasswordToken = require('../models/resetPasswordTokens');
const AccountVerificationToken = require('../models/accountVerificationTokens');

//mailers
const resetPasswordMailer = require('../mailers/reset_password_mailer');
const accountVerificationMailer = require('../mailers/account_verification_mailer');

const accVerEmailWorker = require('../workers/account_verification_email_worker');
const resPwdEmailWorker = require('../workers/password_reset_email_worker');
const queue = require('../config/kue');

//file system and path libraries
const fs = require('fs');
const path = require('path');

//crypto for hashing
const crypto = require('crypto');

//to send flash messages using noty js
const Noty = require('noty');

//render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('home');
  }
  return res.render('user_sign_up', {
    title: "Auth-Sys | SignUp",
    captcha: res.recaptcha
  });
}

//render the sign in page
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.render('home', {
      title: "Auth-Sys | Home"
    });
  }
  return res.render('user_sign_in', {
    title: "Auth-Sys | SignIn"
  });
}

//create a new user account
module.exports.createAccount = async function (req, res) {
  // console.log(req.body);
  try {
    //if passwords dont match
    if (req.body.password != req.body.confirm_password) {
      req.flash('error', 'Passwords dont match');
      return res.redirect('back');
    }
    let user = await User.findOne({ email: req.body.email });
    //if user already exists
    if (user) {
      req.flash('error', 'User already exists');
      console.log("user already exists");
      return res.redirect('back');
    }
    else {
      //create a new user
      user = new User();
      user.email = req.body.email;
      user.name = req.body.name;
      user.verified = false;
      //set password as encrypted hash
      user.setPassword(req.body.password);
      await user.save();

      // create an account verification token
      let accountVerificationToken = await AccountVerificationToken.create({
        user: user._id,
        accessToken: crypto.randomBytes(35).toString('hex'),
        isValid: true
      });

      //populate it with users name and email and send it to him using mailer
      accountVerificationToken = await accountVerificationToken.populate('user', 'email name').execPopulate();
      
      // accountVerificationMailer.newAccountVerificationRequest(accountVerificationToken);
      //add job to the queue using Kue
      let job = queue.create('accountVerificationEmails', accountVerificationToken).save(function (err) {
        if (err) {
          console.log("error in creating a queue ", err);
          return;
        }

        console.log(job.id + " enqueued");
      });

      //if success
      req.flash('success', 'Check mail for account activation');
      return res.redirect('/users/sign-in');
    }
  } catch (err) {
    req.flash('error', 'Internal system error');
    console.log(err);
    return res.redirect('back');
  }
}

//create a news session when user signs in through passport
module.exports.createSession = function (req, res) {
  req.flash('success', 'Logged in Successfully');
  res.redirect('/');
  // try{
  //   let user = await User.findOne({email: req.body.email});
  //   if(user){
  //     if(user.validPassword(req.body.password)){
  //       console.log("Login successful");
  //       return res.redirect('back');
  //     }
  //     else{
  //       console.log("Incorrect Username/Password");
  //       return res.redirect('back');
  //     }
  //   }
  //   else{
  //     console.log("user doesn't exists");
  //     return res.redirect('back');      
  //   }
  // }catch(err){
  //   console.log(err);
  //   return res.redirect('back');
  // }
}

//destroy session when user signs out
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash('success', 'Logged out Successfully');
  return res.redirect('/users/sign-in');
}

//render home page
module.exports.home = function (req, res) {
  return res.render('home', {
    title: "Auth-Sys | Home"
  });
}

//update password after signing in
module.exports.updatePassword = async function (req, res) {
  try {
    //if new password doesnt match
    if (req.body.new_password != req.body.confirm_password) {
      req.flash('error', 'Passwords dont match');
      console.log("passwords dont match");
      return res.redirect('back');
    }
    console.log(req.user.id);
    let user = await User.findById(req.user.id);
    if (user) {
      //if previous password is correct update it
      if (user.validPassword(req.body.old_password)) {
        user.setPassword(req.body.new_password);
        await user.save();
        req.flash('success', 'Password updated successfully');
        console.log("password updated successfully")
      }
      else {
        //if previous password is incorrect
        req.flash('error', 'Incorrect password');
        console.log("incorrect password");
      }
    }
    else {
      req.flash('error', 'user not found');
      console.log("user not found");
    }
    return res.redirect('back');
  } catch (err) {
    console.log(err);
    req.flash('error', 'Internal system error');
    return res.redirect('back');
  }
}

//render forgot password page
module.exports.forgotPassword = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('home');
  }
  return res.render('forgot_password', {
    title: "Auth-Sys | Forgot Password"
  });
}

//create a new password reset request
module.exports.createPasswordResetReq = async function (req, res) {
  try {
    //if email id matches a user
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      //create a new reset password token
      let resetPasswordToken = await ResetPasswordToken.create({
        user: user._id,
        accessToken: crypto.randomBytes(35).toString('hex'),
        isValid: true
      });

      //populate the token and send it through mailer
      resetPasswordToken = await resetPasswordToken.populate('user', 'email name').execPopulate();
      
      //resetPasswordMailer.newResetPwdReq(resetPasswordToken);
      let job = queue.create('resetPasswordEmails', resetPasswordToken).save(function (err) {
        if (err) {
          console.log("error in creating a queue ", err);
          return;
        }

        console.log(job.id + " enqueued");
      });

      req.flash('success', 'Please check your email');
      return res.redirect('back');
    }
    else {
      console.log('Error in finding user to reset password');
      req.flash('error', 'Try again with a valid email address');
      return res.redirect('back');
    }
  } catch (err) {
    req.flash('error', 'Internal Server Error');
    console.log(`Error:  ${err}`);
    return res.redirect('back');
  }
}

//validate reset password link and render reset password page
module.exports.resetPassword = async function (req, res) {
  try {
    //if token exists
    let resetPasswordToken = await ResetPasswordToken.findOne({ accessToken: req.query.accessToken });
    console.log("resetPasswordToken ", resetPasswordToken);
    if (resetPasswordToken) {
      //check if the link hasn't expired
      if (!isLinkTimedOut(resetPasswordToken.createdAt)) {
        return res.render('reset_password', {
          title: "Ayth-Sys | Reset password",
          resetPasswordToken: resetPasswordToken
        });
      }
      else {
        //if link has expired
        console.log("Password link expired");
        req.flash('error', 'Password reset link expired');
        return res.render('forgot_password', {
          title: "Ayth-Sys | Reset password",
          info: "Password reset link expired"
        });
      }
    }
    req.flash('error', 'Password reset link expired or wrong');
    return res.render('forgot_password', {
      title: "Ayth-Sys | Reset password",
      info: "Password reset link expired or wrong"
    });
  } catch (err) {
    req.flash('error', 'Internal Server Error');
    console.log(`Error:  ${err}`);
    return;
  }
}

//reset password -> forgot password
module.exports.createNewPassword = async function (req, res) {
  try {
    //if passwords dont match
    if (req.body.password != req.body.confirm_password) {
      req.flash('error', 'passwords dont match');
      return res.redirect('back');
    }
    let resetPasswordToken = await ResetPasswordToken.findOne({ accessToken: req.body.accessToken });
    //if password token exists and is valid
    if (resetPasswordToken && resetPasswordToken.isValid) {
      let user = await User.findById(resetPasswordToken.user);
      if (user) {
        //set new password
        user.setPassword(req.body.password);
        await user.save();
        console.log("password updated successfully")
        req.flash('success', 'Password updated successfully');
        return res.redirect('/users/sign-in');
      }
    }
    else {
      req.flash('error', 'Password reset link expired or wrong');
      return res.render('forgot_password', {
        title: "Ayth-Sys | Reset password",
        info: "Password reset link expired or wrong"
      });
    }
  } catch (err) {
    req.flash('error', 'Internal Server Error');
    console.log(`Error:  ${err}`);
    return;
  }
}

//activate an account
module.exports.activateAccount = async function (req, res) {
  try {
    console.log("activate account ", req.query);
    let accountVerificationToken = await AccountVerificationToken.findOne({ accessToken: req.query.accessToken });
    //check if token exists and is valid
    if (accountVerificationToken && accountVerificationToken.isValid) {
      //set account to verified
      let user = await User.findByIdAndUpdate(accountVerificationToken.user, { verified: true });
      if (user) {
        console.log("Account activated Successfully");
        //deactivate the link
        await AccountVerificationToken.findByIdAndUpdate(accountVerificationToken.id, { isValid: false });
        req.flash('success', 'Account activated Successfully');
        return res.redirect('/users/sign-in');
      }
    }
    //if account already verified
    else if (accountVerificationToken && !accountVerificationToken.isValid) {
      let user = await User.findById(accountVerificationToken.user);
      if (user && user.verified) {
        req.flash('error', 'Account already verified. Please Login');
        return res.redirect('/users/sign-in');
      }
    }
  } catch (err) {
    req.flash('error', 'Internal Server Error');
    console.log(`Error:  ${err}`);
    return;
  }
}

//helper function to check if the link has expired
isLinkTimedOut = function (linkCreationTime) {
  linkCreationTime = new Date(linkCreationTime);
  linkCreationTime = linkCreationTime.getTime();
  let current = Date.now();
  let diff = current - linkCreationTime;
  diff = diff / 60000;
  return diff > 30;
}