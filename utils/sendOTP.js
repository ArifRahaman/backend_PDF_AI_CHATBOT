// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// require('dotenv').config()
// async function sendOTPEmail(userEmail, otp) {
//   let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "arifrahaman2606@gmail.com",
//       pass: process.env.GMAIL_PASSWORD,
//     },
//   });

//   let mailOptions = {
//     from: "arifrahaman2606@gmail.com",
//     to: userEmail,
//     subject: "Your OTP Code",
//     text: `Your OTP code is ${otp}`,
//   };

//   await transporter.sendMail(mailOptions);
// }
// module.exports = sendOTPEmail;


const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendOTPEmail(userEmail, otp) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

module.exports = sendOTPEmail;
