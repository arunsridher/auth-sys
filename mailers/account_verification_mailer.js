//include node mailer
const nodeMailer = require('../config/nodemailer');
const env = require('../config/environment');

//method to configure the template
exports.newAccountVerificationRequest = (accountVerificationToken) => {
  // account verification token sent from action
//   console.log("inside accountVerificationToken mailer");
//   console.log(accountVerificationToken);

  //html string
  let htmlString = nodeMailer.renderTemplate({accountVerificationToken: accountVerificationToken}, 'accounts/account_verification.ejs');

  //configure mail parameters
  nodeMailer.transporter.sendMail({
      from: `${env.auth_user}@gmail.com`,
      to: accountVerificationToken.user.email,
      subject: "Instructions to Activate you Account",
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