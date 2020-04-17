const fs = require('fs');

const development = {
  name: 'development',
  port: 8000,
  session_secret_key: 'secret-key',
  db: 'auth-sys',
  smtp: {
    service: 'gmail',
    host: "smtp.gmail.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.AuthUser,
      pass: process.env.AuthPass
    }
  }
}

console.log("environment ", process.env.SecretKey);
console.log("environment ", process.env.AuthPass);
module.exports = development;