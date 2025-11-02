import express from "express";

import {
    forgotUserPassword,
    getMyProfile,
    loginUser,
    logoutUser,
    resetUserPassword,
    signupUser,
} from "../controllers/auth.controller.js";

import authenticateUser from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes No authentication required
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotUserPassword);
router.post("/reset-password", resetUserPassword);

// Authentication middleware applied to all routes below
router.use(authenticateUser);

// Protected routes
router.post("/logout", logoutUser);
router.get("/profile", getMyProfile);

export default router;
