import express from "express";
import {
    createProduct,
    getAllProducts,
    getFeaturedProducts,
} from "../controllers/product.js";
import { adminRoute, protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.post("/", protectRoute, adminRoute, createProduct);

export default router;
