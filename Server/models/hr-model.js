import { Schema, model } from "mongoose"
const hrSchema = new Schema({
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
const hr = model('HR', hrSchema)
export default hr;