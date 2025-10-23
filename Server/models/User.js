import {Schema, model} from "mongoose" 
const UserSchema = new Schema({
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

      verificationToken: String,
      resetPasswordToken: String,
      resetPasswordExpires: Date,
},{timestamps: true})

const User = model('User', UserSchema)

export default User;
