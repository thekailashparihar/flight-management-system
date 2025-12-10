import mongoose from "../database/mongodb.config.js";

const SeatClassSchema = new mongoose.Schema(
    {
        total: { type: Number, required: true, min: 0 },
        price: { type: Number, default: 0, min: 0 },
    },
    { _id: false }
);

const FlightSchema = new mongoose.Schema(
    {
        flightNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        airline: {
            type: String,
            required: true,
        },
        route: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Route",
            required: true,
        },
        aircraftModel: {
            type: String,
            required: true,
        },

        minimumTurnaroundTime: {
            type: Number,
            min: 30,
            default: 30,
        },

        seatConfig: {
            economy: {
                type: SeatClassSchema,
                required: true,
            },
            business: {
                type: SeatClassSchema,
                default: null,
            },
            first: {
                type: SeatClassSchema,
                default: null,
            },
        },

        services: [String],

        baggageAllowance: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Flight = mongoose.model("Flight", FlightSchema);

export default Flight;
