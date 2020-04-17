//include file system library
const fs = require('fs');

//environment setup for development
const development = {
  name: 'development',
  port: 8000,
  session_secret_key: 'secret-key',
  db: 'auth-sys',
  site_key: process.env.SiteKey,
  secret_key: process.env.SecretKey,
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
module.exports = development;