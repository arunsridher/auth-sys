//render the sign up page
module.exports.signUp = function(req, res){
  return res.render('user_sign_up', {
      title: "Auth-Sys | SignUp"
  });
}
