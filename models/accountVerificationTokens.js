const mongoose = require('mongoose');

const accountVerificationTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  isValid: {
    type: Boolean,
    required: true
  }
},{
  timestamps:true
});

const AccountVerificationToken = mongoose.model('AccountVerificationToken', accountVerificationTokenSchema);
module.exports = AccountVerificationToken;