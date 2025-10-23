import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import sendMail from "../config/sendMail.js";

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
            try {
                  await sendMail({
                        to: email,
                        subject: `Welcome to Parakh.AI, ${name}! 🎉`,
                        text: `Welcome to Parakh.AI — India’s best AI-powered interview practice app!
We’re excited to have you on board.
Get ready to sharpen your skills, practice real-world interview questions, and boost your confidence — all in one place.

Let’s begin your journey toward landing your dream job!

Warm regards,
The Parakh.AI Team`,
                        html: `
                  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                  <h2>Welcome to <span style="color:#4F46E5;">Parakh.AI</span>, ${name}! 🎉</h2>
                  <p>India’s best <b>AI-powered interview practice app</b> is excited to have you on board!</p>
                  <p>Sharpen your skills, practice real-world interview questions, and boost your confidence — all in one place.</p>
                  <p>Let’s begin your journey toward landing your dream job! 🚀</p>
                  <br>
                  <p>Warm regards,<br><b>The Parakh.AI Team</b></p>
                  </div>
            `,
                  });
            } catch (mailErr) {
                  console.error('Error sending welcome email:', mailErr?.message || mailErr);
            }
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
                  maxAge: 60 * 60 * 1000, 
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
