import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const userRegistration = async (req, res) => {
      try {
            const { name, email, password, isVerified, verificationToken, resetPasswordToken, resetPasswordExpires } = req.body;

            let existingUser = await User.findOne({ email });
            if (existingUser) {
                  return res.status(400).json({
                        message: "User already exists"
                  });
            }

            const salt = await bcrypt.genSalt(10); // 10 is costfactor(Number of hashing rounds): higher = more secure, slower
            const hashPassword = await bcrypt.hash(password, salt);


            const newUser = new User({
                  name,
                  email,
                  password: hashPassword,
                  isVerified,
                  verificationToken,
                  resetPasswordToken,
                  resetPasswordExpires
            });

            await newUser.save();

            return res.status(201).json({
                  message: "User registered successfully",
                  newUser
            });

      } catch (err) {
            res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
};

export const userLogin = async(req, res) =>{
      try{
            const {email, password} = req.body;
            const user = await User.findOne({ email });

            if(!user){
                  return res.status(400).json({
                        message: "Invalid email",
                        email: email,
                  });
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch){
                  return res.status(400).json({
                        message: "Invalid password",
                        password: password,
                  });
            }

            const token = jwt.sign({userId: user?._id, userEmail: user?.email}, process.env.ACCESS_TOKEN, {
                  expiresIn: '1h'
            })

            const cookieOptions = {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                  maxAge: 60 * 60 * 1000, // 1 hour
            };

            res.cookie('token', token, cookieOptions).status(200).json({
                  message: 'Login successfull',
                  token
            })



      } catch (err){
            return res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
}

export const userLogout = async(req, res)=>{
      try {
            const cookieClearOptions = {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            };

            res.clearCookie('token', cookieClearOptions)

            return res.status(200).json({
                  message: 'Logged out',
            })
      } catch (error) {
            return res.status(500).json({
                  message: 'server error',
                  error: error.message
            })
      }
}

export const getProfile = async (req, res) => {
      try {
            // protect middleware sets req.user with decoded token
            const userId = req.user?.userId;
            if (!userId) {
                  return res.status(400).json({ message: 'User id not found in token' });
            }

            const user = await User.findById(userId).select('email');
            if (!user) {
                  return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ email: user.email });
      } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
      }
}
