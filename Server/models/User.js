import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  // Profile image URL
  image: { type: String, default: "" },
  // Preferred AI model selection
  aiModelName: { type: String, default: "" },
  aiModelImage: { type: String, default: "" },
});

// Note: Indexes are automatically created by MongoDB for unique fields
// No need to manually define them again

const User = model("User", userSchema);
export default User;
