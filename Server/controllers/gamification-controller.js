// ...existing code...
import User from "../models/User.js";
import StoreItem from "../models/StoreItem.js";

// ✅ Fetch user profile (coins, achievements, purchased items)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const user = await User.findById(userId)
      .populate("achievements")
      .populate("purchasedItems.item");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ✅ Redeem store item (deduct coins)
export const redeemItem = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) return res.status(400).json({ message: "itemId is required" });

  try {
    const userId = req.user?.userId || req.user?._id;
    const user = await User.findById(userId);
    const item = await StoreItem.findById(itemId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Ensure coins is numeric
    if (typeof user.coins !== "number") user.coins = 0;
    if (user.coins < item.cost)
      return res.status(400).json({ message: "Not enough coins" });

    // Subtract coins
    console.log(`Before redeem: ${user.coins}`);
    user.coins -= item.cost;
    console.log(`After redeem: ${user.coins}`);

    // Ensure purchasedItems is an array
    if (!Array.isArray(user.purchasedItems)) user.purchasedItems = [];

    // Use string comparison to avoid .equals() errors when item stored as string
    const existing = user.purchasedItems.find(
      (i) => String(i.item) === String(item._id)
    );

    if (existing) existing.quantity = (existing.quantity || 0) + 1;
    else user.purchasedItems.push({ item: item._id, quantity: 1 });

    await user.save(); // persist changes

    res.json({
      success: true,
      message: `${item.name} redeemed successfully!`,
      coins: user.coins,
      purchased: user.purchasedItems,
    });
  } catch (error) {
    console.error("Error redeeming item:", error);
    res.status(500).json({ message: "Error redeeming item" });
  }
};
// ...existing code...