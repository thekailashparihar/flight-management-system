import express from "express";

import authenticateUser from "../middlewares/auth.middleware.js";
import authorizeUserRoles from "../middlewares/authorizeRole.middleware.js";

import { addNewRoute, deleteRoute, getAllRoutes, getRouteById, updateRoute } from "../controllers/route.controller.js";

const router = express.Router();

router.get("/", getAllRoutes);
router.get("/:id", getRouteById);

// admin only for create/update/delete

router.use(authenticateUser, authorizeUserRoles(["admin"]));

router.post("/", addNewRoute);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

export default router;
