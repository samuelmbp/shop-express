import mongoose from "mongoose";

const couponScheme = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Code is required"],
            unique: true,
        },
        discountPercentage: {
            type: Number,
            required: [true, "Discount percentage is required"],
            min: 0,
            max: 100,
        },
        expirationDate: {
            type: Date,
            required: [true, "Expiration date is required"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
        },
    },
    { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponScheme);

export default Coupon;
