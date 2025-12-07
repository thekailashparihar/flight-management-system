import User from "../models/user.model.js";
import isValidObjectId from "../utils/objectIdValidator.js";

// Get all users if the role is authorized
export const getAllUsers = async (req, res) => {
    try {
        let users, page, limit, meta, totalPages, hasNextPage, hasPreviousPage;

        // Count total users in the database
        const totalUsers = await User.countDocuments();

        // Check if query parameters are not provided
        // Retrieve all users from the database as plain JavaScript objects
        if (Object.keys(req.query).length == 0) {
            users = await User.find().lean();
            meta = { totalUsers: totalUsers };
        } else {
            // Get page and limit from query string
            page = Number(req.query.page);
            limit = Number(req.query.limit);

            // Calculate total pages based on limit
            totalPages = Math.ceil(totalUsers / limit);

            // Check if next or previous page is available
            hasNextPage = page < totalPages;
            hasPreviousPage = page > 1;

            // Validate page and limit values
            if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
                return res.status(400).json({
                    status: "bad request",
                    message: "Invalid page or limit. Please double-check your input.",
                });
            }

            // Calculate offset for pagination format
            const offset = (page - 1) * limit;
            if (page > totalPages) {
                return res.status(400).json({
                    status: "bad request",
                    totalUsers: totalUsers,
                    totalPages: totalPages,
                    message: `Oops! We only have ${totalPages} pages. Please pick a valid one.`,
                });
            }
            if (limit > totalUsers) {
                return res.status(400).json({
                    status: "bad request",
                    totalUsers: totalUsers,
                    totalPages: totalPages,
                    message: `Limit too high! There are only ${totalUsers} users available.`,
                });
            }
            // Retrieve users from the database with pagination
            users = await User.find().skip(offset).limit(limit).lean();

            // prettier-ignore
            // Replace meta details if query parameters are present
            meta = {
      totalUsers: totalUsers,              // Show total users from database
      totalPages: totalPages,              // Show total pages based on limit
      page: page,                          // Show current page from query
      limit: limit,                        // Show limit from query
      hasNextPage: hasNextPage,            // Indicate if next page is available
      hasPreviousPage: hasPreviousPage,    // Indicate if previous page is available
    };
        }

        // Send success response after fetching users
        return res.status(200).json({
            status: "success",
            message: "Users fetched successfully",
            meta: meta,
            data: users,
        });
    } catch (error) {
        // Handle error if something goes wrong
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Getting a user by Id if role is authorised or user is admin
export const getUserById = async (req, res) => {
    try {
        // Taking logged-in user's ID from JWT/session
        const isLoggedInUserId = req.user.sub;

        // Taking logged-in user's role
        const isLoggedInUserRole = req.user.role;

        // Taking requested user ID from route parameter
        const isRequestedUserId = req.params.id;

        // Validating user object id received from route parameters
        if (!isValidObjectId(isRequestedUserId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid User ID",
            });
        }

        /**
         * Checking if logged-in user is not admin,
         * then he can't fetch profile of other users except himself
         */
        if (isRequestedUserId !== isLoggedInUserId && isLoggedInUserRole !== "admin") {
            // Sending forbidden response if permissions are insufficient
            return res.status(403).json({
                status: "forbidden",
                message: "Insufficient permissions to fetch this profile",
            });
        }

        // Fetching user data using given query param objectId
        const user = await User.findById(isRequestedUserId).lean();

        // Checking if user was not found
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Sending success response after fetching user
        return res.status(200).json({
            status: "success",
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        // Handling error if something went wrong
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Updating user details using ObjectId
export const updateUserById = async (req, res) => {
    try {
        // Taking logged-in user's ID from JWT/session
        const isLoggedInUserId = req.user.sub;

        // Taking logged-in user's role
        const isLoggedInUserRole = req.user.role;

        // Taking requested user ID from route parameter
        const isRequestedUserId = req.params.id;

        // Validating user object id received from route parameters
        if (!isValidObjectId(isRequestedUserId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid User ID",
            });
        }

        /**
         * Checking if logged-in user is not admin,
         * then he can't update profile of other users except himself
         */
        if (isRequestedUserId !== isLoggedInUserId && isLoggedInUserRole !== "admin") {
            // Sending forbidden response if not allowed to update
            return res.status(403).json({
                status: "forbidden",
                message: "Not allowed to update this profile",
            });
        }

        // Taking update data from request body
        const updateData = req.body;

        // Removing sensitive fields from update data
        delete updateData.password; // Not allowing password update here
        delete updateData.role; // Not allowing role change
        delete updateData.isBlocked; // Not allowing block status change
        delete updateData.bookings; // Not allowing direct bookings modification

        // Listing allowed fields for update
        const allowedFields = [
            "firstName",
            "lastName",
            "email",
            "mobileNumber",
            "dateOfBirth",
            "gender",
            "profilePicUrl",
            "address",
            "seatPreference",
            "mealPreference",
        ];

        // Collecting keys from update data to check what is being updated
        const updates = Object.keys(updateData);

        // Checking if all update fields are allowed
        const isValidUpdate = updates.every((field) => allowedFields.includes(field));

        // Sending error response if invalid fields are present
        if (!isValidUpdate) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid fields in update request",
            });
        }

        // Updating user with new data
        const user = await User.findByIdAndUpdate(
            isRequestedUserId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        // Checking if user was not found
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Sending success response after updating user
        return res.status(200).json({
            status: "success",
            data: user,
        });
    } catch (error) {
        // Handling error if something went wrong
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Deleting a user permanently by ID via authorised role or admin
export const deleteUser = async (req, res) => {
    try {
        // Taking user ID from route parameter
        const isRequestedUserId = req.params.id;

        // Validating user object id received from route parameters
        if (!isValidObjectId(isRequestedUserId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid User ID",
            });
        }

        // Finding user and deleting from database
        const user = await User.findByIdAndDelete(isRequestedUserId);

        // Checking if user was not found
        if (!user) {
            return res.status(404).json({ status: "failed", message: "User not found" });
        }

        // Sending success response after deleting user
        res.status(200).json({
            status: "success",
            message: "User deleted successfully",
        });
    } catch (error) {
        // Handling error if something went wrong
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};
