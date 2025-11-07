import User from "../models/User.js";
import StoreItem from "../models/StoreItem.js";

// Add coins when coding or interview
export const addCoins = async (req, res) => {
      const { type } = req.body; // "coding" or "interview"
      const coinsToAdd = type === "coding" ? 10 : 20;

      try {
            const userId = req.user?.userId || req.user?._id;
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });

            user.coins += coinsToAdd;
            await user.save();
            res.json({ success: true, coins: user.coins });
      } catch (error) {
            res.status(500).json({ message: "Server error" });
      }
};

// Fetch user profile (coins, achievements, purchased items)
export const getProfile = async (req, res) => {
      try {
            const userId = req.user?.userId || req.user?._id;
            const user = await User.findById(userId)
                  .populate("achievements")
                  .populate("purchasedItems.item");
            res.json(user);
      } catch (error) {
            res.status(500).json({ message: "Error fetching profile" });
      }
};

// Redeem store item
export const redeemItem = async (req, res) => {
      const { itemId } = req.body;

      try {
            const userId = req.user?.userId || req.user?._id;
            const user = await User.findById(userId);
            const item = await StoreItem.findById(itemId);

            if (!item) return res.status(404).json({ message: "Item not found" });
            if (user.coins < item.cost)
                  return res.status(400).json({ message: "Not enough coins" });

            user.coins -= item.cost;

            const existing = user.purchasedItems.find(i => i.item.equals(item._id));
            if (existing) existing.quantity += 1;
            else user.purchasedItems.push({ item: item._id });

            await user.save();

            res.json({ success: true, coins: user.coins, purchased: user.purchasedItems });
      } catch (error) {
            res.status(500).json({ message: "Error redeeming item" });
      }
};
