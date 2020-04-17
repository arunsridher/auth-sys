const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    required: true
  },
  hash:String,
  salt: String
},{
  timestamps:true
});

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
}

userSchema.methods.validPassword = function(password) { 
  let generatedHash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`); 
  return this.hash === generatedHash; 
}; 

const User = mongoose.model('User', userSchema);
module.exports = User;