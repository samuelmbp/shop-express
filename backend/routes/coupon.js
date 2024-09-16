import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.js";

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.get("/validate", protectRoute, validateCoupon);

export default router;
