const mongoose =require("mongoose");
const EmployeeSchema = new mongoose.Schema({
  //   name: String,
  //   email: String,
  //   password: String,

  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // basic email validation
  },
  dob: {
    type: Date,
    required: true,
  },
  universityname: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String, // URL or file path of the profile image
  },
  refreshToken: { type: String }, // New field for refresh token
  otp: String,
  otpExpiry: Date,
});

const EmployeeModel=mongoose.model("employees",EmployeeSchema)
module.exports=EmployeeModel