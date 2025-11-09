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

// Ensure an index on username for uniqueness at the database level
userSchema.index({ username: 1 }, { unique: true });

const User = model("User", userSchema);
export default User;
