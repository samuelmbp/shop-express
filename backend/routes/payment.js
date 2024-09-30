import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
    checkoutSuccess,
    createCheckoutSession,
} from "../controllers/payment.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
