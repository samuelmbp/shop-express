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
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    res.send("Hello from the auth route - login");
};

export const logout = async (req, res) => {
    res.send("Hello from the auth route - logout");
};
