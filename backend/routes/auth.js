import express from "express";
import {
    signup,
    login,
    logout,
    refreshToken,
    getProfile,
} from "../controllers/auth.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/profile", protectRoute, getProfile);

export default router;
