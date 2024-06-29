const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const http = require("http");
const bcrypt = require("bcrypt");

// const socketIo = require("socket.io");



const generateAuthTokenAndSetCookie = require('./utils/generateAuthTokenAndSetCookie'); // Adjust the path as necessary
const authController=require("./controllers/Users/user")
// const io=app.use();
const PostModel = require("./models/Post");
const authControllerPdf=require("./controllers/Pdf/Pdf")
// const sendOTPEmail=require("./utils/sendOTP");
// const bcrypt = require("bcrypt");
const app = express();
const server = http.createServer(app);

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files
// Middleware
app.use(express.json());
// const corsOptions = {
//   origin: process.env.FRONTEND_URL || "http://localhost:5173", // Replace with your allowed origin
//   credentials: true,
// };
// app.use(cors(corsOptions));
// const io = socketIo(server);
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://frontendaipdfarif.onrender.com",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
app.use("/uploads", express.static("uploads"));
// Models
const EmployeeModel = require("./models/employee");
const PdfModel = require("./models/pdf");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/pdfs"); // Specify the folder to save uploaded PDFs
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const storageed = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Specify the destination directory for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Specify the file name format
  },
});

const uploaded = multer({ storageed });



// app.get("/posts/:postId", async (req, res) => {
//   const { postId } = req.params;
//   try {
//     const post = await PostModel.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching post" });
//   }
// });
// app.get("/posts/:postId", async (req, res) => {
//   const { postId } = req.params;
//   try {
//     const post = await PostModel.findById(postId);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching post" });
//   }
// });



const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profileimage"); // Save uploaded files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Generate unique filenames
  },
});

// Multer upload instance
const fileUpload = multer({ storage: fileStorage });

app.post(
  "/upload-profile-image",
  fileUpload.single("profileImage"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const { email } = req.body;
    const filePath = req.file.path;
    // const imageUrl = `https://backend-aipdfarif.onrender.com/${filePath}`;
      const imageUrl = `${process.env.BASE_URL}/${filePath}`;

    try {
      const updatedUser = await EmployeeModel.findOneAndUpdate(
        { email },
        { profileImage: imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send("User not found.");
      }

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user profile image:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);


app.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const users = await EmployeeModel.find({
      $or: [
        { username: { $regex: query, $options: "i" } }, // Case-insensitive search for username
        { email: { $regex: query, $options: "i" } }, // Case-insensitive search for email
        { universityname: { $regex: query, $options: "i" } }, // Case-insensitive search for university name
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Internal Server Error");
  }
});






app.post("/posts/:postId/like", async (req, res) => {
  const postId = req.params.postId;

  try {
    // Find the post by postId
    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment the likes count
    post.likes += 1;

    // Save the updated post
    await post.save();

    res
      .status(200)
      .json({ message: "Post liked successfully", likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/posts/:postId/comments", async (req, res) => {
  const postId = req.params.postId;
  const { text } = req.body;
  try {
    // Find the post by postId
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // Add the new comment to the post
    post.comments.push({ text });
    await post.save();

    res.status(200).json({
      message: "Comment added successfully",
      comment: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.put("/changepassword", async (req, res) => {
  const { password, id } = req.body;

  try {
    // Find the user by ID
    const user = await EmployeeModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while changing the password" });
  }
});
app.post("/register",authController.register)

app.get("/pdfs/:pdfId", async (req, res) => {
  try {
    const { pdfId } = req.params;
    const pdf = await PdfModel.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    // Send the PDF file as a download
    const filePath = path.join(__dirname, pdf.pdfPath);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




app.post("/posts", upload.single("cover"), async (req, res) => {
  const {
    title,
    summary,
    content,
    author,
    authorname,
    authorprofilepicture,
  } = req.body; // Add author to destructuring
  const cover = req.file ? req.file.path : null;

  try {
    const post = new PostModel({ title, summary, content, cover, author,authorname,authorprofilepicture }); // Include author in the post creation
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});


app.get("/posts", async (req, res) => {
  try {
    const posts = await PostModel.find();
    const fullUrl = req.protocol + "://" + req.get("host");
    const postsWithFullUrl = posts.map((post) => {
      if (post.cover) {
        post.cover = `${fullUrl}/${post.cover}`;
      }
      return post;
    });
    res.status(200).send(postsWithFullUrl);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});





app.post("/login",authController.login)
app.post("/verify-otp",authController.verifyotp);


app.get("/posts/by-author/:authorId", async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const posts = await PostModel.find({ author: authorId }).populate(
      "author comments.author"
    );
    res.json(posts); // Ensure this returns an array
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const updatedUser = await EmployeeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/upload-pdf", upload.single("pdf"), authControllerPdf.uploadPdf);

// app.get("/user-pdfs/:userId", async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const userPdfs = await PdfModel.find({ userId });
//     res.status(200).json(userPdfs);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching PDFs", error: error.message });
//   }
// });

app.get("/user-pdfs/:userId", authControllerPdf.getPdf);

// Delete PDF
// app.delete('/delete-pdf/:id', async (req, res) => {
//   try {
//     const pdf = await PdfModel.findByIdAndDelete(req.params.id);
//     if (!pdf) {
//       return res.status(404).send({ message: 'PDF not found' });
//     }
//     res.send({ message: 'PDF deleted successfully' });
//   } catch (error) {
//     res.status(500).send({ message: 'Error deleting PDF' });
//   }
// });




app.delete("/posts/delete/:id",async(req,res)=>{
  try{
   const deletesuccess=await PostModel.findByIdAndDelete(req.params.id);
   if(deletesuccess){
    return res.json(success);
   }
  }catch(err){
    console.log(err);
  }
})
app.delete("/delete-pdf/:id", authControllerPdf.deletedPdf);
// Edit PDF title
app.put('/edit-pdf-title/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const pdf = await PdfModel.findByIdAndUpdate(req.params.id, { title }, { new: true });
    if (!pdf) {
      return res.status(404).send({ message: 'PDF not found' });
    }
    res.send({ message: 'PDF title updated successfully', pdf });
  } catch (error) {
    res.status(500).send({ message: 'Error updating PDF title' });
  }
});




// const upload = multer({ dest: "uploads/" });

// Load Deepgram API key from environment variables

// Start the server
const PORT=process.env.PORT
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// server.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
