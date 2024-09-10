import User from "../models/user.js";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    try {
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });

        res.status(201).json({
            user,
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
