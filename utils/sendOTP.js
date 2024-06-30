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


// const nodemailer = require("nodemailer");
// require("dotenv").config();

// async function sendOTPEmail(userEmail, otp) {
//   try {
//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_PASSWORD,
//       },
//     });

//     let mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: userEmail,
//       subject: "Your OTP Code",
//       text: `Your OTP code is ${otp}`,
//     };

//     let info = await transporter.sendMail(mailOptions);
//     console.log("Email sent: " + info.response);
//   } catch (error) {
//     console.error("Error sending email: ", error);
//   }
// }

// module.exports = sendOTPEmail;
const jwt = require("jsonwebtoken");
require("dotenv").config();
// JWT_SECRET="adefrgrgrgrg"
const generateAuthTokenAndSetCookie = (user, res) => {
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    dob: user.dob,
    universityname: user.universityname,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "6d",
  });
  
  res.cookie("jwt", token, {
    maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days
    httpOnly: false,
    sameSite: "none",
    secure: false,
    // secure: process.env.NODE_ENV !== "development",
  });
};

module.exports = generateAuthTokenAndSetCookie;


