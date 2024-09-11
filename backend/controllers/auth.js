import { redis } from "../lib/redis.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    const SEVEN_DAYS = 60 * 60 * 24 * 7;
    await redis.set(`refresh_token_${userId}`, refreshToken, "EX", SEVEN_DAYS);
};

const setCookies = (res, accessToken, refreshToken) => {
    const FIFTEEN_MINUTES = 60 * 15;
    const SEVEN_DAYS = 60 * 60 * 24 * 7;

    res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // Prevents CSRF attack
        maxAge: FIFTEEN_MINUTES * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: SEVEN_DAYS * 1000,
    });
};

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    try {
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });
        const { accessToken, refreshToken } = generateTokens(user._id);

        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: "User created successfully",
        });
    } catch (error) {
        console.log("Error in signup controller: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const correctPassword = await user.comparePassword(password);

        if (user && correctPassword) {
            const { accessToken, refreshToken } = generateTokens(user._id);

            storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("Error in login controller: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET
            );
            await redis.del(`refresh_token_${decoded.userId}`);
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logged out controller: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res
                .status(401)
                .json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const storedToken = await redis.get(`refresh_token_${decoded.userId}`);

        if (storedToken !== refreshToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "15m",
            }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.log("Error in refresh token controller: ", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
