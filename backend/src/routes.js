import express from "express";

import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/users.routes.js";

import routeRoutes from "./routers/routes.routes.js";
import flightRoutes from "./routers/flights.routes.js";
import scheduleRoutes from "./routers/schedules.routes.js";

const router = express.Router();

// Registering API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.use("/routes", routeRoutes);
router.use("/flights", flightRoutes);
router.use("/schedules", scheduleRoutes);

export default router;
