const User = require('../models/user');
const ResetPasswordToken = require('../models/resetPasswordTokens');
const resetPasswordMailer = require('../mailers/reset_password_mailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const Noty = require('noty');

//render the sign up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('home');
  }
  return res.render('user_sign_up', {
    title: "Auth-Sys | SignUp"
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

module.exports.createAccount = async function (req, res) {
  try {
    if (req.body.password != req.body.confirm_password) {
      req.flash('error', 'Passwords dont match');
      return res.redirect('back');
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      req.flash('error', 'User already exists');
      console.log("user already exists");
      return res.redirect('back');
    }
    else {
      user = new User();
      user.email = req.body.email;
      user.name = req.body.name;
      user.setPassword(req.body.password);
      await user.save();
      req.flash('success', 'Account created successfully');
      return res.redirect('/users/sign-in');
    }
  } catch (err) {
    req.flash('error', 'Internal system error');
    console.log(err);
    return res.redirect('back');
  }
}

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

module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash('success', 'Logged out Successfully');
  return res.redirect('/users/sign-in');
}

module.exports.home = function (req, res) {
  return res.render('home', {
    title: "Auth-Sys | Home"
  });
}

module.exports.updatePassword = async function (req, res) {
  try {
    if (req.body.new_password != req.body.confirm_password) {
      req.flash('error', 'Passwords dont match');
      console.log("passwords dont match");
      return res.redirect('back');
    }
    console.log(req.user.id);
    let user = await User.findById(req.user.id);
    if (user) {
      if (user.validPassword(req.body.old_password)) {
        user.setPassword(req.body.new_password);
        await user.save();
        req.flash('success', 'Password updated successfully');
        console.log("password updated successfully")
      }
      else {
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

module.exports.forgotPassword = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('home');
  }
  return res.render('forgot_password', {
    title: "Auth-Sys | Forgot Password"
  });
}

module.exports.createPasswordResetReq = async function (req, res) {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      let resetPasswordToken = await ResetPasswordToken.create({
        user: user._id,
        accessToken: crypto.randomBytes(35).toString('hex'),
        isValid: true
      });

      resetPasswordToken = await resetPasswordToken.populate('user', 'email name').execPopulate();
      resetPasswordMailer.newResetPwdReq(resetPasswordToken);
      
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

module.exports.resetPassword = async function (req, res) {
  try {
    let resetPasswordToken = await ResetPasswordToken.findOne({ accessToken: req.query.accessToken });
    console.log("resetPasswordToken ", resetPasswordToken);
    if (resetPasswordToken) {
      if(!isLinkTimedOut(resetPasswordToken.createdAt)){
        return res.render('reset_password', {
          title: "Ayth-Sys | Reset password",
          resetPasswordToken: resetPasswordToken
        });
      }
      else{
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

module.exports.createNewPassword = async function (req, res) {
  try {
    if (req.body.password != req.body.confirm_password) {
      req.flash('error', 'passwords dont match');
      return res.redirect('back');
    }
    let resetPasswordToken = await ResetPasswordToken.findOne({ accessToken: req.body.accessToken });
    if (resetPasswordToken && resetPasswordToken.isValid) {
      let user = await User.findById(resetPasswordToken.user);
      if (user) {
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

isLinkTimedOut = function(linkCreationTime){
  linkCreationTime = new Date(linkCreationTime);
  linkCreationTime = linkCreationTime.getTime();
  let current = Date.now();
  let diff = current - linkCreationTime;
  diff = diff/60000;
  return diff > 30;
}
