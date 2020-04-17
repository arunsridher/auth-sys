const queue = require('../config/kue');

const accountVerificationMailer = require('../mailers/account_verification_mailer');

queue.process('accountVerificationEmails', function(job, done){
  accountVerificationMailer.newAccountVerificationRequest(job.data);
  done();
});