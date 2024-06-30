// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// // JWT_SECRET="adefrgrgrgrg"
// const generateAuthTokenAndSetCookie = (user, res) => {
//   const payload = {
//     _id: user._id,
//     username: user.username,
//     email: user.email,
//     dob: user.dob,
//     universityname: user.universityname,
//   };

//   const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//     expiresIn: "6d",
//   });
  
//   res.cookie("jwt", token, {
//     maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days
//     httpOnly: false,
//     sameSite: "strict",
//     // secure: process.env.NODE_ENV !== "development",
//   });
// };

// module.exports = generateAuthTokenAndSetCookie;
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
  
  // res.cookie("jwt", token, {
  //   maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days
  //   httpOnly: true,
  //   sameSite: "lax",
  //   secure: false,
  //   // secure: process.env.NODE_ENV !== "development",
  // });
    res.cookie("jwt", token, {
    maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days
    httpOnly: false,
    sameSite: "strict",
    secure: true
  });
};

module.exports = generateAuthTokenAndSetCookie;

