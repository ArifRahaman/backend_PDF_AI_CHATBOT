const bcrypt = require("bcrypt");
const EmployeeModel = require("../../models/employee");
const sendOTPEmail=require("../../utils/sendOTP")
const generateAuthTokenAndSetCookie=require("../../utils/generateAuthTokenAndSetCookie")
// function generateOTP() {
//   // return crypto.randomBytes(3).toString('hex'); // 6-digit OTP
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }
const generateOTP = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  user.otp = otp;
  user.otpExpiry = otpExpiry;

  try {
    await user.save();
    console.log(`OTP generated and saved for user: ${user.email}`);
  } catch (err) {
    console.error("Error saving OTP:", err);
    throw new Error("Error saving OTP");
  }
};

const register= async (req, res) => {
  try {
    const { username, email, password, dob, universityname } = req.body;

    // Validate required fields
    if (!username || !email || !password || !dob || !universityname) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Validate date format
    const dateOfBirth = new Date(dob);
    if (isNaN(dateOfBirth.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid date format for Date of Birth." });
    }

    // Check if the user already exists
    const existingEmployee = await EmployeeModel.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const newEmployee = new EmployeeModel({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      dob: dateOfBirth,
      universityname: universityname.trim(),
    });

    // Save the new employee to the database
    const savedEmployee = await newEmployee.save();

    // Send success response
    res.status(201).json({
      message: "User is successfully signed up",
      employee: savedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await EmployeeModel.findOne({ email });

//     if (user) {
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (isMatch) {
//         // ... (OTP generation and sending logic)
//         return res.status(200).json({ message: "OTP sent to your email" });
//       } else {
//         return res.status(401).json({ message: "Incorrect password" });
//       }
//     } else {
//       return res.status(404).json({ message: "No record found" });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await EmployeeModel.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Generate OTP and save to the user's document
        await generateOTP(user);

        // Send OTP to user's email
        await sendOTPEmail(user.email, user.otp);

        return res.status(200).json({ message: "OTP sent to your email" });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      return res.status(404).json({ message: "No record found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const verifyotp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found`);
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otp === otp && user.otpExpiry > Date.now()) {
      console.log(`OTP verified for user: ${email}`);
      try {
        generateAuthTokenAndSetCookie(user, res);
      } catch (tokenError) {
        console.error("Error generating auth token:", tokenError);
        return res.status(500).json({ error: "Error generating auth token" });
      }
      user.otp = null;
      user.otpExpiry = null;
      try {
        await user.save();
      } catch (saveError) {
        console.error("Error saving user after OTP verification:", saveError);
        return res.status(500).json({ error: "Error saving user data" });
      }

      return res
        .status(200)
        .json({ message: "OTP verified", userId: user._id, username: user.username });
    } else {
      console.error(`Invalid or expired OTP for user: ${email}`);
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ error: err.message });
  }
}



module.exports = {
  register,
  login,verifyotp
};
