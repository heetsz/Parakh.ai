import mongoose from "mongoose";

const storeItemSchema = new mongoose.Schema({
      name: String,
      description: String,
      cost: Number,
      image: String,
});

export default mongoose.model("StoreItem", storeItemSchema);
