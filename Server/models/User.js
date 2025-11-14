import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },

  // ✅ Added fields for Gamification
  coins: { type: Number, default: 500 },
  achievements: [
    {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      default: [],
    },
  ],
  purchasedItems: [
    {
      item: { type: Schema.Types.ObjectId, ref: "StoreItem" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

// Note: Indexes are automatically created by MongoDB for unique fields
// No need to manually define them again

const User = model("User", userSchema);
export default User;
