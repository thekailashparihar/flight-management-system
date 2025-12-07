import mongoose from "../database/mongodb.config.js";

// Validating mongoose object id received from route parameters

const isValidObjectId = (objectId) => {
    return mongoose.isValidObjectId(objectId);
};
export default isValidObjectId;
