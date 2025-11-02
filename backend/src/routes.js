import express from "express";

import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/users.routes.js";

const router = express.Router();

// Registering API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
