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

export const getSchedules = (req, res) => {};
export const getScheduleById = (req, res) => {};
export const updateSchedule = (req, res) => {};
export const deleteSchedule = (req, res) => {};
