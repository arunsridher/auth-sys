//include passport
const passport = require('passport');

//include passport's local startegy
const LocalStrategy = require('passport-local').Strategy;

//include user model
const User = require('../models/user');

//Authentication using passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
  },
  function (req, email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) {
        req.flash('error', 'Internal Server Error');
        console.log('Error in finding user --> Passport');
        return done(err);
      }

      if (!user || !user.validPassword(password)) {
        req.flash('error', 'Inavlid username/password');
        console.log('Inavlid username/password')
        return done(null, false);
      }

      if (user) {
        console.log('User valid and password matches');
        return done(null, user);
      }
    });
  }
));

// serializing the user to decide which is kept in the cookies
passport.serializeUser(function(user, done){
  done(null, user.id);
});

//deserializing the user from cookies
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
      if(err){
          console.log('Error in finding user --> Passport');
          return done(err);
      }
      return done(null, user);
  });
});

passport.checkAuthentication = function(req, res, next){
  //if the user is signed in pass on the request to next function (controller's action)
  if(req.isAuthenticated()){
      return next();
  }

  //if the user is not signed in
  return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next){
  if(req.isAuthenticated()){
      //req.user contains the current signed in user from the session cookie and we are just sending it to the locals for the views
      res.locals.user = req.user;
  }
  next();
}

module.exports = passport;