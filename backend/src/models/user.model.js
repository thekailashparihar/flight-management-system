import bcrypt from "bcryptjs";
import mongoose from "../database/mongodb.config.js";

const userSchema = new mongoose.Schema(
    {
        // Required user details
        firstName: { type: String, required: true, trim: true, maxlength: 30 },

        lastName: { type: String, required: true, trim: true, maxlength: 30 },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
        },
        mobileNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: (mobileNumber) => /^[0-9]{10,15}$/.test(mobileNumber),
                message: "Invalid phone number format",
            },
        },

        password: { type: String, required: true, minlength: 8, select: false },

        // Optional user details

        dateOfBirth: {
            type: Date,
            validate: {
                validator: (dateOfBirth) => dateOfBirth < new Date(),
                message: "Date of birth must be in the past",
            },
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            default: null,
        },

        // Here user means "passenger or end customer"
        role: {
            type: String,
            enum: ["admin", "manager", "agent", "user"],
            default: "user",
        },

        profilePicUrl: { type: String, default: null },

        address: {
            street: { type: String, default: null, trim: true },
            city: { type: String, default: null, trim: true },
            district: { type: String, default: null, trim: true },
            state: { type: String, default: null, trim: true },
            pincode: { type: String, default: null, trim: true },
            country: { type: String, default: null, trim: true },
        },

        bookings: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Booking",
            default: [],
        },

        seatPreference: {
            type: String,
            enum: ["aisle", "window", "middle"],
            default: null,
        },

        mealPreference: {
            type: String,
            enum: ["veg", "non-veg", "eggetarian", "jain", "vegan"],
            default: null,
        },

        resetPasswordToken: { type: String, default: null, select: false },

        resetPasswordTokenExpires: { type: Date, default: null, select: false },

        isBlocked: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        minimize: false,
    }
);

// Hash the user's password before saving the user document to the database
userSchema.pre("save", async function (next) {
    try {
        // Check if the password field has been modified (or is new)
        if (this.isModified("password")) {
            // Generate a salt for hashing
            const salt = await bcrypt.genSalt(10);

            const hashedPassword = await bcrypt.hash(this.password, salt);

            // Replace the plain text password with the hashed password
            this.password = hashedPassword;
        }
    } catch (error) {
        // Pass any errors to the next middleware
        next(error);
    }
});

const User = mongoose.model("User", userSchema);
export default User;
