import mongoose from "../database/mongodb.config.js";

const routeSchema = new mongoose.Schema(
    {
        codeFrom: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        codeTo: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        fromAirportName: {
            type: String,
            required: true,
        },
        toAirportName: {
            type: String,
            required: true,
        },

        durationMinutes: {
            type: Number,
            default: null,
        },
        distanceKm: {
            type: Number,
            default: null,
        },

        stops: [
            new mongoose.Schema(
                {
                    code: { type: String, uppercase: true },
                    airportName: String,
                },
                { _id: false }
            ),
        ],

        notes: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

routeSchema.index({ codeFrom: 1, codeTo: 1 }, { unique: true });

const Route = mongoose.model("Route", routeSchema);

export default Route;
