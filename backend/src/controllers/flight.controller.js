import Flight from "../models/flight.model.js";
import Route from "../models/route.model.js";
import isValidObjectId from "../utils/objectIdValidator.js";

export const addNewFlight = async (req, res) => {
    try {
        // Get flight details from request body
        const { flightNumber, route } = req.body;

        // Check if flight with same number exists
        const existingFlight = await Flight.findOne({ flightNumber });

        if (existingFlight) {
            return res.status(409).json({
                status: "conflict",
                message: `Flight with this number ${flightNumber} already exists.`,
            });
        }

        // Validate Route Id
        if (!isValidObjectId(route)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Route ID ",
            });
        }

        // Check if route exists in database
        const existingRoute = await Route.findById(route);

        if (!existingRoute) {
            return res.status(404).json({
                status: "failed",
                message: "Route not found. Please provide a valid route ID.",
            });
        }

        // Create new flight
        const flight = await Flight.create(req.body);

        return res.status(201).json({
            status: "success",
            message: "Flight created successfully",
            flight,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getAllFlights = async (req, res) => {
    try {
        // Fetch all flights from database
        const flights = await Flight.find().lean();

        // Count total number of flights
        const countFlights = await Flight.countDocuments();

        return res.status(200).json({
            status: "success",
            message: "Flight fetched successfully",
            totalFlights: countFlights,
            flights,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const getFlightById = async (req, res) => {
    try {
        // Get flight ID from params
        const { id } = req.params;

        // Validate Flight Id
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Flight ID ",
            });
        }

        // Find flight by ID
        const flight = await Flight.findById(id).lean();

        if (!flight) {
            return res.status(404).json({
                status: "failed",
                message: "Flight not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Flight fetched successfully",
            flight,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const updateFlightById = async (req, res) => {
    try {
        // Get flight ID from params
        const { id } = req.params;

        // Validate Flight Id
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Flight ID ",
            });
        }

        // Build update query object
        const updateQuery = {};

        // Loop through request body to add fields to updateQuery
        for (let key in req.body) {
            if (key !== "seatConfig") {
                updateQuery[key] = req.body[key];
            }
        }

        // Handle nested seatConfig update
        if (req.body.seatConfig) {
            for (let key in req.body.seatConfig) {
                updateQuery[`seatConfig.${key}`] = req.body.seatConfig[key];
            }
        }

        console.log("Final updateQuery:", updateQuery);

        // Perform update operation
        const result = await Flight.updateOne({ _id: id }, { $set: updateQuery }, { new: true, runValidators: true });

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: "failed",
                message: "Flight not found",
            });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                status: "no_change",
                message: "Flight not update",
            });
        }

        // Fetch updated flight data
        const updateFlight = await Flight.findById(id).lean();

        return res.status(200).json({
            status: "success",
            message: "Flight update successfully",
            updateFlight,
        });
    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const deleteFlightById = async (req, res) => {
    try {
        // Get flight ID from params
        const { id } = req.params;

        // Validate Flight Id
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Flight ID ",
            });
        }

        // Delete flight by ID
        const flight = await Flight.findByIdAndDelete(id);

        if (!flight) {
            return res.status(404).json({
                status: "failed",
                message: "Flight not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Flight deleted successfully",
            flight, // yaha deleted flight ka document bheja ja raha hai
        });
    } catch (error) {
        console.error("Error deleting flight:", error);

        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
