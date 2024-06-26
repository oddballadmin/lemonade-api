import User from '../models/user.js';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
export const registerUser = async (req, res) => {
    try {
        console.log('Request Body:', req.body);

        const { firstName, lastName, email, zipcode, birthdate, password, password2, phone } = req.body;

        if (!firstName) return res.status(400).json({ error: "First name is required" });
        if (!lastName) return res.status(400).json({ error: "Last name is required" });
        if (!email) return res.status(400).json({ error: "Email is required" });
        if (!password) return res.status(400).json({ error: "Password is required" });
        if (!password2) return res.status(400).json({ error: "Please confirm password" });
        if (password !== password2) return res.status(400).json({ error: "Passwords do not match" });
        if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
        if (!phone) return res.status(400).json({ error: "Phone number is required" });
        if (!zipcode) return res.status(400).json({ error: "Zip code is required" });
        if (!birthdate) return res.status(400).json({ error: "Birthday is required" });

        if (await User.findOne({ phone })) return res.status(400).json({ error: "Phone number already in use" });
        if (await User.findOne({ email })) return res.status(400).json({ error: "Email already exists" });

        // Hash the password
        const hashedPassword = await hashPassword(password);

        const user = new User({
            firstName,
            lastName,
            phone,
            zipcode,
            birthdate: new Date(birthdate),
            email,
            password: hashedPassword
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login User Endpoint
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { email: user.email, _id: user._id, name: user.firstName },
            process.env.JWT_SECRET,
            { expiresIn: '48hr' }  // Optional: set token expiration
        );

        res.cookie('token', token, {
            // httpsOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            httpsOnly: process.env.VITE_NODE_ENV === 'production',
            secure: process.env.VITE_NODE_ENV === 'production',
            sameSite: 'None'


        });

        return res.status(200).json({ message: "Logged in successfully", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get User Profile Endpoint
export const getProfile = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get User Endpoint
export const getUser = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ name: `${user.firstName} ${user.lastName}`, email: user.email, id: user._id });
    } catch (error) {
        console.log('Error verifying token or fetching user:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: "Invalid token" });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: "Token has expired" });
        } else {
            return res.status(500).json({ error: "Server error" });
        }
    }
};
