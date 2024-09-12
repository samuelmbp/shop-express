import { redis } from "../lib/redis.js";
import Product from "../models/product.js";
import cloudinary from "../lib/cloudinary.js";

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

export const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, category } = req.body;

        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
        }

        const product = new Product({
            name,
            price,
            description,
            image: cloudinaryResponse?.secure_url
                ? cloudinaryResponse.secure_url
                : "",
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Error in create product controller: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const publicImageId = product.image.split("/").pop().split(".")[0];

            try {
                await cloudinary.uploader.destroy(`products/${publicImageId}`);
                console.log("Image deleted successfully from cloudinary");
            } catch (error) {
                console.log("Error deleting image from cloudinary: ", error);
            }
        }

        await Product.findByIdAndUpdate(id);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error in delete product controller: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            ({
                $sample: { size: 3 },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    image: 1,
                    description: 1,
                },
            }),
        ]);

        res.json(products);
    } catch (error) {
        console.log("Error in get recommended products controller: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const products = await Product.find({ category });
        res.json({ products });
    } catch (error) {
        console.log("Error in get products by category controller: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
