import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.js";
import {
    getAnalyticsData,
    getDailySalesData,
} from "../controllers/analytics.js";

const router = express.Router();

router.get("/", adminRoute, protectRoute, async (req, res) => {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    try {
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - SEVEN_DAYS);
        const dailySalesData = await getDailySalesData(startDate, endDate);

        res.json({
            analyticsData,
            dailySalesData,
        });
    } catch (error) {
        console.log("Error in analytics route: ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
