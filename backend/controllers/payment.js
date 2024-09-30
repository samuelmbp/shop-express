export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res
                .status(400)
                .json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;
        const lineItems = products.map((product) => {
            // Stripe wants format of pennies
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
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
            },
        });

        const MINIMUM_AMOUNT_IN_PENNIES = 20_000;
        if (totalAmount >= MINIMUM_AMOUNT_IN_PENNIES) {
            await createNewCoupon(req.user._id);
        }

        res.status(200).json({
            id: session.id,
            totalAmount: totalAmount / 100,
        });
    } catch (error) {}
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
}

async function createNewCoupon(userId) {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + THIRTY_DAYS),
        userId: userId,
    });

    await newCoupon.save();

    return newCoupon;
}
