import Flight from "../models/flight.model.js";
import Schedule from "../models/schedule.model.js";
import isValidObjectId from "../utils/objectIdValidator.js";

export const createSchedule = async (req, res) => {
    try {
        const { flightId, departureDateTime, arrivalDateTime, seats } = req.body;

        // Validate flight ID
        if (!isValidObjectId(flightId)) {
            return res.status(400).json({ status: "error", message: "Invalid flight ID" });
        }

        // Ensure flight exists
        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ status: "failed", message: "Flight not found" });
        }

        // convert the input date and time strings into Date objects for comparison and calculation
        const newDeparture = new Date(departureDateTime);
        const newArrival = new Date(arrivalDateTime);

        // Stop if any date is invalid
        if (isNaN(newDeparture.getTime()) || isNaN(newArrival.getTime())) {
            return res.status(400).json({ status: "error", message: "Invalid departure or arrival datetime" });
        }

        // Departure must be earlier than arrival
        if (newDeparture >= newArrival) {
            return res.status(400).json({ status: "error", message: "Departure time must be before arrival time" });
        }

        // Calculate buffer time before departure (turnaround time)
        const bufferTimeInMs = flight.minimumTurnaroundTime * 60000; // Convert minutes to milliseconds

        // newDeparture - buffer
        const bufferedDeparture = new Date(newDeparture.getTime() - bufferTimeInMs);

        // Prevent overlapping schedules for the same flight
        const conflict = await Schedule.findOne({
            flightId,
            departureDateTime: { $lte: newArrival }, // existing.start < new.end
            arrivalDateTime: { $gte: bufferedDeparture }, // existing.end > (new.start - buffer)
        });

        if (conflict) {
            return res.status(409).json({
                status: "failed",
                message: "Schedule conflict: another schedule overlaps this time range",
                data: {
                    scheduleId: conflict._id,
                    flightId: conflict.flightId,
                    departureDateTime: conflict.departureDateTime,
                    arrivalDateTime: conflict.arrivalDateTime,
                    turnAroundTime: `${flight.minimumTurnaroundTime} minutes`,
                    status: conflict.status,
                },
            });
        }

        const seatsConfig = {};

        const seatTypes = ["economy", "business", "first"];

        for (let type of seatTypes) {
            const seatType = seats?.[type];

            if (!seats?.economy) {
                return res.status(400).json({
                    status: "failed",
                    message: "Economy seats are required for every schedule",
                });
            }

            if (!seatType) continue;

            const { total, booked = 0, price } = seatType;

            if (total === null || total === undefined) continue;

            const totalSeatsInFlight = flight.seats?.[type]?.total;

            if (totalSeatsInFlight == null) {
                return res.status(404).json({
                    status: "failed",
                    message: `No ${type} class is available on this flight.`,
                });
            }
            if (total > totalSeatsInFlight) {
                return res.status(400).json({
                    status: "failed",
                    message: `We only have ${totalSeatsInFlight} ${type} seats available — you requested ${total}. please reduce the requested seats or choose a different flight.`,
                });
            }

            if (booked > total) {
                return res
                    .status(400)
                    .json({ status: "failed", message: `${type} booked (${booked}) cannot exceed total (${total})` });
            }

            if (price == null || !Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    status: "failed",
                    message: `${type} seat price is required and must be a non-negative number.`,
                });
            }

            seatsConfig[type] = { total, booked, price };
        }

        console.log("seatsConfig", seatsConfig);

        // Save new schedule
        const schedule = await Schedule.create({
            flightId,
            departureDateTime: newDeparture,
            arrivalDateTime: newArrival,
            seats: seatsConfig,
        });

        return res.status(201).json({
            status: "success",
            message: "Schedule created successfully",
            schedule,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const getSchedules = async (req, res) => {
    try {
        const [schedules, totalSchedules] = await Promise.all([
            Schedule.find().lean({ virtuals: true }),
            Schedule.countDocuments(),
        ]);

        return res.status(200).json({
            status: "success",
            message: "Schedules fetched successfully",
            totalSchedules,
            schedules,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const getScheduleById = async (req, res) => {
    try {
        const scheduleId = req.params.id;

        // Validate schedule ID
        if (!isValidObjectId(scheduleId)) {
            return res.status(400).json({ status: "error", message: "Invalid schedule ID" });
        }

        // Find schedule by ID
        const schedule = await Schedule.findById(scheduleId);

        if (!schedule) {
            return res.status(404).json({ status: "failed", message: "Schedule not found" });
        }

        return res.status(200).json({
            status: "success",
            message: "Schedule fetched successfully",
            schedule,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const { departureDateTime, arrivalDateTime, seats } = req.body;

        // Validate schedule ID
        if (!isValidObjectId(scheduleId)) {
            return res.status(400).json({ status: "error", message: "Invalid schedule ID" });
        }

        // Find existing schedule
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ status: "failed", message: "Schedule not found" });
        }

        // Fetch flight details for validation
        const flight = await Flight.findById(schedule.flightId);
        if (!flight) {
            return res.status(404).json({ status: "failed", message: "Flight not found" });
        }

        // Validate and process departure/arrival times if provided
        if (departureDateTime || arrivalDateTime) {
            const newDeparture = departureDateTime ? new Date(departureDateTime) : schedule.departureDateTime;
            const newArrival = arrivalDateTime ? new Date(arrivalDateTime) : schedule.arrivalDateTime;

            // Validate date format
            if (isNaN(newDeparture.getTime()) || isNaN(newArrival.getTime())) {
                return res.status(400).json({ status: "error", message: "Invalid departure or arrival datetime" });
            }

            // Departure must be before arrival
            if (newDeparture >= newArrival) {
                return res.status(400).json({ status: "error", message: "Departure time must be before arrival time" });
            }

            // Check for schedule conflicts
            const bufferTimeInMs = flight.minimumTurnaroundTime * 60000;
            const bufferedDeparture = new Date(newDeparture.getTime() - bufferTimeInMs);

            const conflict = await Schedule.findOne({
                _id: { $ne: scheduleId },
                flightId: schedule.flightId,
                departureDateTime: { $lte: newArrival },
                arrivalDateTime: { $gte: bufferedDeparture },
            });

            if (conflict) {
                return res.status(409).json({
                    status: "failed",
                    message: "Schedule conflict: another schedule overlaps this time range",
                    data: {
                        scheduleId: conflict._id,
                        departureDateTime: conflict.departureDateTime,
                        arrivalDateTime: conflict.arrivalDateTime,
                    },
                });
            }

            schedule.departureDateTime = newDeparture;
            schedule.arrivalDateTime = newArrival;
        }

        // Update seats configuration if provided
        if (seats) {
            // ensure seats object exists
            schedule.seats = schedule.seats ?? {};

            const seatTypes = ["economy", "business", "first"];

            for (let type of seatTypes) {
                const seatType = seats[type];

                if (!seatType) continue;

                const totalSeatsInFlight = flight.seats?.[type]?.total;

                if (totalSeatsInFlight == null) {
                    return res.status(404).json({
                        status: "failed",
                        message: `No ${type} class is available on this flight.`,
                    });
                }

                const existing = schedule.seats?.[type] ?? {};

                // Use provided values if present, otherwise keep existing
                const newTotal = seatType.total !== undefined ? seatType.total : existing.total;
                const newBooked = seatType.booked !== undefined ? seatType.booked : (existing.booked ?? 0);
                const newPrice = seatType.price !== undefined ? seatType.price : existing.price;

                if (type === "economy" && newTotal === 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: "Economy seats cannot be zero",
                    });
                }

                if (newTotal === undefined || newTotal === null || !Number.isFinite(newTotal) || newTotal < 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: `${type} total seats is required and must be a non-negative number.`,
                    });
                }

                if (!Number.isFinite(newBooked) || newBooked < 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: `${type} booked must be a non-negative number.`,
                    });
                }

                if (!Number.isFinite(newPrice) || newPrice < 0) {
                    return res.status(400).json({
                        status: "failed",
                        message: `${type} price is required and must be a non-negative number.`,
                    });
                }

                if (newTotal > totalSeatsInFlight) {
                    return res.status(400).json({
                        status: "failed",
                        message: `We only have ${totalSeatsInFlight} ${type} seats available — you requested ${newTotal}.`,
                    });
                }

                if (newBooked > newTotal) {
                    return res.status(400).json({
                        status: "failed",
                        message: `${type} booked seats (${newBooked}) should not be more than total seats (${newTotal}).`,
                    });
                }

                schedule.seats[type] = {
                    total: newTotal,
                    booked: newBooked,
                    price: newPrice,
                };
            }

            // console.log("updated seats:", schedule.seats);
        }

        // Save updated schedule
        await schedule.save();

        return res.status(200).json({
            status: "success",
            message: "Schedule updated successfully",
            schedule,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;

        // Validate schedule ID
        if (!isValidObjectId(scheduleId)) {
            return res.status(400).json({ status: "error", message: "Invalid schedule ID" });
        }

        // Find and delete schedule
        const schedule = await Schedule.findByIdAndDelete(scheduleId);

        if (!schedule) {
            return res.status(404).json({ status: "failed", message: "Schedule not found" });
        }

        const seatTypes = ["economy", "business", "first"];

        for (let type of seatTypes) {
            if (schedule.seats[type].booked > 0) {
                return res.status(400).json({
                    status: "failed",
                    message: `Cannot delete schedule with active bookings for ${type} seats`,
                });
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Schedule deleted successfully",
            schedule,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
    }
};
