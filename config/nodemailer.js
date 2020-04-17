const nodemailer = require('nodemailer');
const env = require('../config/environment');
const path = require('path');
const ejs = require('ejs');

let transporter = nodemailer.createTransport(env.smtp);

let renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, '../views/mailers', relativePath),
    data,
    function(err, template){
      if(err){
        console.log('Error in rendering template');
        return;
      }
      mailHTML = template;
    }
  );
  return mailHTML;
}

module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate
}