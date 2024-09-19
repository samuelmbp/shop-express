import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/payment.js";
import Coupon from "../models/coupon.js";
import { stripe } from "../lib/stripe.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/create-checkout-session", protectRoute, async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res
                .status(400)
                .json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;
        const lineItems = products.map((product) => {
            // Stripe wants format of cents
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "gbp",
                    product_data: {
                        name: product.name,
                        image: [product.image],
                    },
                    unit_amount: amount,
                },
            };
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({
                code: couponCode,
                userId: req.user._id,
                isActive: true,
            });
            if (coupon) {
                totalAmount -= Math.round(
                    (totalAmount * coupon.discountPercentage) / 100
                );
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                      {
                          coupon: await createStripeCoupon(
                              coupon.discountPercentage
                          ),
                      },
                  ]
                : [],
        });
    } catch (error) {}
});

async function createStripeCoupon(discountPercentage) {
    
}

export default router;
