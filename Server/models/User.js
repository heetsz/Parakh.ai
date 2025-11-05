import { Schema, model } from "mongoose"
const userSchema = new Schema({
      name: {
            type: String,
      },
      email: {
            type: String,
            unique: true,
            required: true,
      },
      password: {
            type: String,
            required: true
      },
      isVerified: {
            type: Boolean,
            default: false
      },
      verificationCode: {
            type: String,
      },
      verificationCodeExpires: {
            type: Date,
      },
})
const User = model('User', userSchema)
export default User;