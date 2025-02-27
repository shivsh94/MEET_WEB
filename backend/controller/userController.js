import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../model/user.js";

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    // console.log("token", token);
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    // Verify token with Google
    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    // console.log("googleRes :",googleRes);
    
    const { sub, name, email, picture } = googleRes.data;

    // Check if user exists in DB
    let user = await User.findOne({ googleId: sub });
    // console.log("find" ,user);
    

    if (!user) {
      user = new User({ googleId: sub, name, email, profilePicture: picture });
      await user.save();
    }
    // console.log("new",user);
    

    // Generate JWT Token
    const Token = jwt.sign(
      {id:user._id ,email: user.email  },  
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );                
    res.cookie("token", Token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({success:true ,message: "Login successful", user, token: Token });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(400).json({success:false, message: "Invalid Google Token" });
  }
};

// export const getProfile = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({success:false, message: "Unauthorized" });

//     // Verify JWT Token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");

//     if (!user) return res.status(404).json({success:false, message: "User not found" });

//     res.json(user);
//   } catch (error) {
//     console.error("Profile Fetch Error:", error);
//     res.status(400).json({success:false, message: "Invalid Token" });
//   }
// };
export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({success:true, message: "Logged out" });
};
