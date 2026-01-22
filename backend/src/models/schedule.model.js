import mongoose from "../database/mongodb.config.js";

const ScheduleSeatClassSchema = new mongoose.Schema(
    {
        total: { type: Number, required: true, min: 0 },
        booked: { type: Number, default: 0, min: 0 },
        price: { type: Number, required: true, min: 0 },
    },
    {
        _id: false,
        toJSON: { virtuals: true }, // include virtuals in JSON response
        toObject: { virtuals: true }, // include virtuals in plain object
    },
);

// Virtual field to calculate available seats (not stored in DB)
ScheduleSeatClassSchema.virtual("available").get(function () {
    return this.total - this.booked;
});

// Validation: booked seats should not exceed total seats
ScheduleSeatClassSchema.pre("validate", function (next) {
    if (this.booked > this.total) {
        throw new Error("Booked seats cannot exceed total seats");
    }
    next();
});

const scheduleSchema = new mongoose.Schema(
    {
        flightId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Flight",
            required: true,
        },

        departureDateTime: {
            type: Date,
            required: true,
        },

        arrivalDateTime: {
            type: Date,
            required: true,
        },

        seats: {
            economy: { type: ScheduleSeatClassSchema, required: true },
            business: { type: ScheduleSeatClassSchema },
            first: { type: ScheduleSeatClassSchema },
        },

        status: {
            type: String,
            enum: ["scheduled", "boarding", "departed", "in-air", "landed", "delayed", "canceled"],
            default: "scheduled",
        },
    },
    { timestamps: true },
);

// Prevent duplicate schedules for same flight and same departure time
scheduleSchema.index({ flightId: 1, departureDateTime: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
