import express from "express";
import {
    addToCart,
    removeAllFromCart,
    getCartProducts,
    updateQuantity,
} from "../controllers/cart.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);

export default router;
