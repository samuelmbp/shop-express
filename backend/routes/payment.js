import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/payment.js";
import Coupon from "../models/coupon.js";
import { stripe } from "../lib/stripe.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);

export default router;
