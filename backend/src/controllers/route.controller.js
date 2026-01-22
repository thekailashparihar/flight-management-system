import Route from "../models/route.model.js";
import isValidObjectId from "../utils/objectIdValidator.js";

export const addNewRoute = async (req, res) => {
    try {
        const { codeFrom, codeTo, fromAirportName, toAirportName } = req.body;

        // Validate required fields exist in request body
        if (!codeFrom || !codeTo || !fromAirportName || !toAirportName) {
            return res.status(400).json({
                status: "error",
                message: "Required fields missing: codeFrom, codeTo, fromAirportName, toAirportName",
            });
        }

        // Check if a route with same codes already exists
        const existingRoute = await Route.findOne({ codeFrom, codeTo });
        if (existingRoute) {
            return res.status(409).json({
                status: "duplicate",
                message: "Route Already Exist",
            });
        }

        // Create and save new route to database
        const newRoute = await Route.create(req.body);

        return res.status(201).json({
            status: "success",
            message: "Route Created Successfully",
            data: newRoute,
        });
    } catch (error) {
        console.error("Route creation error:", error);

        return res.status(500).json({
            status: "error",
            message: "Route Creation failed",
            error: error.name,
            details: error.message,
        });
    }
};

export const getAllRoutes = async (req, res) => {
    try {
        // Fetch all routes from database
        const routes = await Route.find().lean();

        // Return 404 if no routes found
        if (!routes.length) {
            return res.status(404).json({
                status: "success",
                message: "No routes found",
                data: [],
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Route fetched Successfully",
            data: routes,
        });
    } catch (error) {
        console.error("Route fetching failed:", error);

        return res.status(500).json({
            status: "error",
            message: "Route Fetching failed",
            error: error.name,
            details: error.message,
        });
    }
};

export const getRouteById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Route ID format
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Route ID ",
            });
        }
        // Find route by ID
        const route = await Route.findById(id).lean();

        // Return error if route not found
        if (!route) {
            return res.status(404).json({
                status: "error",
                message: "Route not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Route fetched successfully",
            data: route,
        });
    } catch (error) {
        console.error("Route fetching failed:", error);

        return res.status(500).json({
            status: "error",
            message: "Route Fetching failed",
            error: error.name,
            details: error.message,
        });
    }
};
export const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Route ID format
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Route ID ",
            });
        }

        const updateData = req.body;

        // Check for duplicates if route codes are being updated
        if (updateData.codeFrom || updateData.codeTo) {
            const existingRoute = await Route.findById(id);

            const newCodeFrom = updateData.codeFrom || existingRoute.codeFrom;
            const newCodeTo = updateData.codeTo || existingRoute.codeTo;

            const duplicateRoute = await Route.findOne({
                codeFrom: newCodeFrom,
                codeTo: newCodeTo,
                _id: { $ne: id },
            });

            if (duplicateRoute) {
                return res.status(409).json({
                    status: "duplicate",
                    message: "Route with this codeFrom and codeTo already exists ",
                    existRoute: duplicateRoute._id,
                });
            }
        }

        // Perform route update
        const updatedRoute = await Route.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true },
        );

        if (!updatedRoute) {
            return res.status(404).json({
                status: "error",
                message: "Route not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Route updated successfully",
            data: updatedRoute,
        });
    } catch (error) {
        console.error("Route update error:", error);

        return res.status(500).json({
            status: "error",
            message: "Route update failed",
            error: error.name,
            details: error.message,
        });
    }
};

export const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate Route ID format
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid Route ID ",
            });
        }

        // Find and delete route by ID
        const route = await Route.findByIdAndDelete(id).lean();

        // Return 404 if route not found
        if (!route) {
            return res.status(404).json({
                status: "error",
                message: "Route not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Route Delete Successfully",
        });
    } catch (error) {
        console.error("Route deletion error:", error);

        return res.status(500).json({
            status: "error",
            message: "Route deletion failed",
            error: error.name,
            details: error.message,
        });
    }
};
