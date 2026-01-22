import express from "express";
import authenticateUser from "../middlewares/auth.middleware.js";
import authorizeUserRoles from "../middlewares/authorizeRole.middleware.js";

import {
    createSchedule,
    deleteSchedule,
    getScheduleById,
    getSchedules,
    updateSchedule,
} from "../controllers/schedule.controller.js";

const router = express.Router();

router.get("/", getSchedules);
router.get("/:id", getScheduleById);

router.use(authenticateUser, authorizeUserRoles(["admin"]));

router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;
