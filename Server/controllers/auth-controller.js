import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendMail from "../config/sendMail.js";

export const registration = async (req, res) => {
      try {
            let { name, email, password, username } = req.body;
            // Basic validation
            if (!username || typeof username !== 'string' || !username.trim()) {
                  return res.status(400).json({ message: 'Username is required' });
            }
            // Normalize username to lowercase trimmed form for uniqueness
            username = username.trim().toLowerCase();

            // Prevent duplicates by email or username
            let existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) {
                  return res.status(400).json({
                        message: "User with that email or username already registered"
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
            const newUser = new User({
                  name,
                  email,
                  username,
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
            const foundUser = await User.findOne({ email });
            if (!foundUser) {
                  return res.status(404).json({ message: "User not found" });
            }
            if (foundUser.isVerified) {
                  return res.status(400).json({ message: "User already verified" });
            }
            if (!foundUser.verificationCode || !foundUser.verificationCodeExpires) {
                  return res.status(400).json({ message: "No verification code found. Please register again." });
            }
            if (foundUser.verificationCodeExpires < new Date()) {
                  return res.status(400).json({ message: "Verification code expired. Please register again." });
            }
            if (foundUser.verificationCode !== code) {
                  return res.status(400).json({ message: "Invalid verification code." });
            }
            foundUser.isVerified = true;
            foundUser.verificationCode = undefined;
            foundUser.verificationCodeExpires = undefined;
            await foundUser.save();

            const token = jwt.sign({ userId: foundUser._id, username: foundUser.username }, process.env.ACCESS_TOKEN, {
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
            let { username, password } = req.body;
            if (!username || typeof username !== 'string') {
                  return res.status(400).json({ message: 'Username is required' });
            }
            username = username.trim().toLowerCase();
            const foundUser = await User.findOne({ username });

            if (!foundUser) {
                  return res.status(400).json({
                        message: "Invalid username",
                        username: username,
                  });
            }
            if (!foundUser.isVerified) {
                  return res.status(400).json({
                        message: "Email not verified. Please verify your email before logging in.",
                  });
            }
            const isMatch = await bcrypt.compare(password, foundUser.password)
            if (!isMatch) {
                  return res.status(400).json({
                        message: "Invalid password",
                        password: password,
                  });
            }

            const token = jwt.sign({ userId: foundUser?._id, username: foundUser?.username }, process.env.ACCESS_TOKEN, {
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
            // req.user is now the full user object from protect middleware
            const userId = req.user?._id || req.user?.userId;
            if (!userId) {
                  return res.status(400).json({ message: 'User id not found in token' });
            }

            // If req.user is already the full user object, return it
            if (req.user?.email && req.user?.username) {
                  return res.status(200).json(req.user);
            }

            // Otherwise, lookup by id
            const foundUser = await User.findById(userId);
            if (!foundUser) {
                  return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(foundUser);
      } catch (error) {
            return res.status(500).json({ message: 'Server error', error: error.message });
      }
}