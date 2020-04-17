const queue = require('../config/kue');

const resetPasswordMailer = require('../mailers/reset_password_mailer');

queue.process('resetPasswordEmails', function(job, done){
  resetPasswordMailer.newResetPwdReq(job.data);
  done();
});