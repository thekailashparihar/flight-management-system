import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import User from "../models/user.model.js";
import generateToken from "../middlewares/jwt.middleware.js";
import cookieOptions from "../config/cookie.config.js";

// To handle user signup process
export const signupUser = async (req, res) => {
    try {
        // Taking email and mobile number from request body
        const { email, mobileNumber } = req.body;

        // Making an object to search user in database
        const userParams = { $or: [] };

        if (email) {
            userParams.$or.push({ email }); // To push email in userParams
        }
        if (mobileNumber) {
            userParams.$or.push({ mobileNumber }); // To push mobile numberin userParams
        }

        // To check if user already exists with same email or mobile number
        const existingUser = await User.findOne(userParams);

        if (existingUser) {
            // To find which field is duplicate
            const duplicates =
                existingUser.email === email &&
                existingUser.mobileNumber === mobileNumber
                    ? `email ${email} and mobile number ${mobileNumber}`
                    : existingUser.email === email
                    ? `email ${email}`
                    : `mobile number ${mobileNumber}`;

            // Sending response if user already exists
            return res.status(409).json({
                status: "conflict",
                message: `An account already exists with this ${duplicates}`,
            });
        }

        // To create a new user with given data
        const newUser = await User.create(req.body);

        // Making payload for JWT token
        const payload = {
            email: newUser.email,
            role: newUser.role,
        };
        const userId = newUser._id.toString();

        // To generate JWT token and set it in cookie
        await generateToken(payload, userId, res);

        // Sending success response after signup
        res.status(201).json({
            status: "success",
            message: `Congratulation! ${newUser.firstName} ${newUser.lastName} Your account has been created successfully`,
        });
    } catch (error) {
        // To handle any error during signup
        res.status(500).json({
            status: "error",
            message: "User registration failed",
            error: error.name,
            details: error.message,
        });
    }
};

// To handle user login process
export const loginUser = async (req, res) => {
    try {
        // Taking email, mobile number and password from request body
        const { email, mobileNumber, password } = req.body;

        // To allow only one of email or mobile number, not both or none
        if ((!email && !mobileNumber) || (email && mobileNumber)) {
            return res.status(400).json({
                status: "failed",
                message:
                    "Please provide either email or mobile number, not both.",
            });
        }

        // To check if password is given
        if (!password) {
            return res
                .status(422)
                .json({ status: "failed", message: "Password is required." });
        }

        // Making an object to search user in database
        const userParams = {};

        // To prefer email if user gave it, otherwise using mobile number
        if (email) {
            userParams.email = email; // To search user by email
        } else {
            userParams.mobileNumber = mobileNumber; // To search user by mobile number
        }

        // To find user and also select password field
        const user = await User.findOne(userParams).select("+password");

        // To check if user exists
        if (!user) {
            return res
                .status(401)
                .json({ status: "failed", message: "User not found!" });
        }

        // To get hashed password from user document
        const hashedPassword = user.password;

        // To compare given password with stored hash
        const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

        // To check if password matched or not
        if (!isPasswordMatch) {
            return res
                .status(401)
                .json({ status: "failed", message: "Invalid Password" });
        }

        // Making payload for JWT token
        const payload = {
            email: user.email,
            role: user.role,
        };
        const userId = user._id.toString();

        // To generate JWT token and set it in cookie
        await generateToken(payload, userId, res);

        // Sending success response after login
        res.status(200).json({
            status: "success",
            message: `Welcome back, ${user.firstName}! You have logged in successfully.`,
        });
    } catch (error) {
        // To handle any error during login
        res.status(500).json({
            status: "error",
            message: "User login failed",
            error: error.name,
            details: error.message,
        });
    }
};

// To handle user logout process
export const logoutUser = (_req, res) => {
    try {
        // To clear the JWT cookie from browser
        res.clearCookie("jwtAuthToken", cookieOptions);
        return res.status(200).json({
            status: "success",
            message: "User logged out successfully",
        });
    } catch (error) {
        // To handle any error during logout
        return res.status(500).json({
            status: "failed",
            message: "Logout failed",
            error: error.name,
            details: error.message,
        });
    }
};

// To handle forgot password request
export const forgotUserPassword = async (req, res) => {
    try {
        // Taking email and mobile number from request body
        const { email, mobileNumber } = req.body;

        // To allow only one of email or mobile number, not both or none
        if ((!email && !mobileNumber) || (email && mobileNumber)) {
            return res.status(400).json({
                status: "failed",
                message:
                    "Please provide either email or mobile number, not both.",
            });
        }
        // Making an object to search user in database
        const userParams = {};

        // To prefer email if user gave it, otherwise using mobile number
        if (email) {
            userParams.email = email;
        } else {
            userParams.mobileNumber = mobileNumber;
        }

        // To find user by email or mobile number
        const user = await User.findOne(userParams);

        // To check if user exists
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: `User not found with given email or mobile number.`,
            });
        }

        // To generate a random token for password reset
        const token = uuidv4();

        // To hash the token before saving in database
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // To save hashed token and expiry time in user document
        user.resetPasswordToken = hashedToken;
        user.resetPasswordTokenExpires = Date.now() + 1000 * 60 * 60; // Token valid for 1 hour
        await user.save();

        // Sending response with reset token (in real app, send via email/SMS)
        return res.status(200).json({
            status: "success",
            message: "Password Reset token generated",
            token: token,
        });
    } catch (error) {
        // To log and handle any error during forgot password
        console.error("Forgot Password Error:", error);

        return res.status(500).json({
            status: "error",
            message:
                "Unable to process your request at this time. Please try again later.",
            error: error.name,
            details: error.message,
        });
    }
};

// To handle password reset using token
export const resetUserPassword = async (req, res) => {
    try {
        // Taking token and new password from request body
        const { token, newPassword } = req.body;

        // To check if new password is valid
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({
                status: "failed",
                message: "Password must be at least 8 characters long",
            });
        }

        // To hash the token for searching in database
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // To find user with matching reset token and valid expiry
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpires: { $gt: Date.now() },
        });

        // To check if user exists and token is not expired
        if (!user) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid or expired token",
            });
        }
        user.password = newPassword;

        // To remove reset token and expiry after successful reset
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpires = null;
        await user.save();

        // Sending success response after password reset
        return res
            .status(200)
            .json({ status: "success", message: "Password reset successful" });
    } catch (error) {
        // To handle any error during password reset
        return res.status(500).json({
            status: "error",
            message:
                "Unable to process your request at this time. Please try again later.",
            error: error.name,
            details: error.message,
        });
    }
};

// Get Logged In User Profile
export const getMyProfile = async (req, res) => {
    try {
        // Extracting user ID from valid token payload
        const userId = req.user.sub;

        // Getting a complete user object from the database using the user ID
        const user = await User.findById(userId).lean();

        // If no user is found, return 404 Not Found
        if (!user) {
            return res.status(404).json({
                status: "failed",
                message: "User not found",
            });
        }

        // On success, return user details (excluding sensitive fields as per schema)
        return res.status(200).json({
            status: "success",
            user: user,
        });
    } catch (error) {
        // Log the error internally if needed, then return 500 Internal Server Error
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            detailed: error.message,
        });
    }
};
