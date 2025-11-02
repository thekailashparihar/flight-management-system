import mongoose from "../database/mongodb.config.js";

// Validating user object id received from route parameters

const isValidObjectId = (ObjectId, res) => {
    if (!mongoose.isValidObjectId(ObjectId))
        return res.status(400).json({
            status: "failed",
            message: "Invalid User ID",
        });
};
export default isValidObjectId;
