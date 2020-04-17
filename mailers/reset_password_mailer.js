const nodeMailer = require('../config/nodemailer');
const env = require('../config/environment');

exports.newResetPwdReq = (resetPasswordToken) => {
  console.log("inside newResetPassword mailer");
  console.log(resetPasswordToken);
  let htmlString = nodeMailer.renderTemplate({resetPasswordToken: resetPasswordToken}, 'accounts/reset_password.ejs');
  nodeMailer.transporter.sendMail({
      from: `${env.auth_user}@gmail.com`,
      to: resetPasswordToken.user.email,
      subject: "Instructions to Reset Passwword",
      html: htmlString
  }, (err, info) => {
      if(err){
          console.log(`Username : ${env.auth_user}`);
          console.log(env.auth_pass);
          console.log("Error in sending email ", err);
          return;
      }
      console.log("Mail sent: ", info);
      return;
  });
}