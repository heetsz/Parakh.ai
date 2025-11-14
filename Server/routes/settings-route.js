import express from "express";
import { protect } from "../middlewares/protect.js";
import { upload, uploadAvatar, changeEmail, changePassword, listAiModels, setAiModel, changeName, deleteAccount } from "../controllers/settings-controller.js";

const router = express.Router();

// Avatar upload
router.post("/settings/avatar", protect, upload.single("image"), uploadAvatar);

// Email change
router.patch("/settings/email", protect, changeEmail);

// Password change
router.patch("/settings/password", protect, changePassword);

// AI Model list and selection
router.get("/settings/ai-models", protect, listAiModels);
router.patch("/settings/ai-model", protect, setAiModel);

// Name change
router.patch("/settings/name", protect, changeName);

// Delete account
router.delete("/settings/account", protect, deleteAccount);

export default router;
