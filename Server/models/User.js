import { Schema, model } from "mongoose"
const userSchema = new Schema({
      name: {
            type: String,
      },
      username: {
            type: String,
            unique: true,
            required: true,
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
// Ensure an index on username for uniqueness at the database level
userSchema.index({ username: 1 }, { unique: true });
const User = model('User', userSchema)
export default User;