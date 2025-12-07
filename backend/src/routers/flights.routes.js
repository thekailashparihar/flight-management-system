import express from "express";
import authenticateUser from "../middlewares/auth.middleware.js";
import authorizeUserRoles from "../middlewares/authorizeRole.middleware.js";
import {
    addNewFlight,
    deleteFlightById,
    getAllFlights,
    getFlightById,
    updateFlightById,
} from "../controllers/flight.controller.js";

const router = express.Router();

router.get("/", getAllFlights);
router.get("/:id", getFlightById);

router.use(authenticateUser, authorizeUserRoles(["admin"]));

router.post("/", addNewFlight);
router.put("/:id", updateFlightById);
router.delete("/:id", deleteFlightById);

export default router;
