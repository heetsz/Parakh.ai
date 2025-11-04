import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import hr from "../models/hr-model.js";
import sendMail from "../config/sendMail.js";

export const registration = async (req, res) => {
      try {
            const { name, email, password } = req.body;

            let existingUser = await hr.findOne({ email });
            if (existingUser) {
                  return res.status(400).json({
                        message: "User already registered"
                  });
            }

            // Generate a random 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

            // Send verification code to email
            await sendMail({
                  to: email,
                  subject: "Parakh.ai Email Verification",
                  text: `Your verification code is: ${verificationCode}`,
                  html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
            });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            // Save user with code, not verified yet
            const newUser = new hr({
                  name,
                  email,
                  password: hashPassword,
                  isVerified: false,
                  verificationCode,
                  verificationCodeExpires: codeExpires,
            });
            await newUser.save();

            return res.status(200).json({
                  message: "Verification code sent to email. Please verify to complete registration.",
                  email,
            });
      } catch (err) {
            res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
};

export const verifyEmailCode = async (req, res) => {
      try {
            const { email, code } = req.body;
            const user = await hr.findOne({ email });
            if (!user) {
                  return res.status(404).json({ message: "User not found" });
            }
            if (user.isVerified) {
                  return res.status(400).json({ message: "User already verified" });
            }
            if (!user.verificationCode || !user.verificationCodeExpires) {
                  return res.status(400).json({ message: "No verification code found. Please register again." });
            }
            if (user.verificationCodeExpires < new Date()) {
                  return res.status(400).json({ message: "Verification code expired. Please register again." });
            }
            if (user.verificationCode !== code) {
                  return res.status(400).json({ message: "Invalid verification code." });
            }
            user.isVerified = true;
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();

            const token = jwt.sign({ userId: user._id, userEmail: user.email }, process.env.ACCESS_TOKEN, {
                  expiresIn: '1h'
            });
            const isProd = process.env.NODE_ENV === 'production';
            const cookieOptions = {
                  httpOnly: true,
                  secure: isProd, // required for cross-site cookies on HTTPS
                  sameSite: isProd ? 'none' : 'lax',
                  maxAge: 60 * 60 * 1000,
            };
            return res.cookie('token', token, cookieOptions).status(200).json({
                  message: "Email verified and user registered.",
                  token
            });
      } catch (err) {
            res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
};

export const login = async (req, res) => {
      try {
            const { email, password } = req.body;
            const user = await hr.findOne({ email });

            if (!user) {
                  return res.status(400).json({
                        message: "Invalid email",
                        email: email,
                  });
            }
            if (!user.isVerified) {
                  return res.status(400).json({
                        message: "Email not verified. Please verify your email before logging in.",
                  });
            }
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                  return res.status(400).json({
                        message: "Invalid password",
                        password: password,
                  });
            }

            const token = jwt.sign({ userId: user?._id, userEmail: user?.email }, process.env.ACCESS_TOKEN, {
                  expiresIn: '1h'
            })

            const isProd = process.env.NODE_ENV === 'production';
            const cookieOptions = {
                  httpOnly: true,
                  secure: isProd,
                  sameSite: isProd ? 'none' : 'lax',
                  maxAge: 60 * 60 * 1000,
            };

            return res.cookie('token', token, cookieOptions).status(200).json({
                  message: 'Login successfull',
                  token
            })
      } catch (err) {
            return res.status(500).json({
                  message: "Server error",
                  error: err.message
            });
      }
}

export const logout = async (req, res) => {
      try {
            const isProd = process.env.NODE_ENV === 'production';
            const cookieClearOptions = {
                  httpOnly: true,
                  secure: isProd,
                  sameSite: isProd ? 'none' : 'lax',
            };
            res.clearCookie('token', cookieClearOptions)

            return res.status(200).json({
                  message: 'Logged out',
            })
      } catch (error) {
            return res.status(500).json({
                  message: 'Server error',
                  error: error.message
            })
      }
}

export const getProfile = async (req, res) => {
      try {
            const userId = req.user?.userId;
            const email = req.user?.userEmail;
            if (!userId) {
                  return res.status(400).json({ message: 'User id not found in token' });
            }

            const user = await hr.findOne({email})
            if (!user) {
                  return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(user);
      } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
      }
}