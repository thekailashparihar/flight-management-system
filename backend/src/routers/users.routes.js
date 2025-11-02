import express from "express";

import {
    deleteUser,
    getAllUsers,
    getUserById,
    updateUserById,
} from "../controllers/users.controller.js";

import authenticateUser from "../middlewares/auth.middleware.js";
import authorizeUserRoles from "../middlewares/authorizeRole.middleware.js";

const router = express.Router();

// Authentication middleware applied to all routes below
router.use(authenticateUser);

router.get("/:id", getUserById);
router.put("/:id", updateUserById);

// Admin middleware applied to all routes below
router.use(authorizeUserRoles(["admin"]));

router.get("/", getAllUsers);
router.delete("/:id", deleteUser);

export default router;
