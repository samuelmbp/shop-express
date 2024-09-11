import { redis } from "../lib/redis.js";
import Product from "../models/product.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.log("Error in get all products controller: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        // check first in redis for products
        let featuredProducts = await redis.get("featured_products");
        if (featuredProducts) {
            return res.json({ products: JSON.parse(featuredProducts) });
        }

        // get from database MONGODB
        featuredProducts = Product.find({ isFeatured: true }).lean();

        if (!featuredProducts) {
            res.statius(404).json({ message: "No featured products found" });
        }

        // store products in redis for quick access
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.json({ products: featuredProducts });
    } catch (error) {
        console.log(
            "Error in get featured products controller: ",
            error.message
        );
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createProduct = async (req, res) => {};
