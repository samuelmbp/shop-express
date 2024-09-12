import express from "express";
import {
    createProduct,
    getAllProducts,
    getFeaturedProducts,
    deleteProduct,
} from "../controllers/product.js";
import { adminRoute, protectRoute } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
