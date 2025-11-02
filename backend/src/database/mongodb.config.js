import mongoose from "mongoose";

// Construct MongoDB URI using environment variables
let { MONGODB_URI, DB_NAME, MONGODB_URI_OPTIONS, MONGODB_URI_LOCAL, NODE_ENV } =
    process.env;

// Get the current environment (development or production)
const NodeEnv = NODE_ENV;
console.info(`\nEnvironment Mode : ${NodeEnv}`);

// In development mode, override and use local database
if (NodeEnv === "development") {
    MONGODB_URI = MONGODB_URI_LOCAL;
}

// Function to establish connection with MongoDB database
export const establishDBConnection = async () => {
    try {
        // Validate required environment variables
        if (!MONGODB_URI || !DB_NAME || !MONGODB_URI_OPTIONS) {
            throw new Error(
                "Missing MONGODB_URI or DB_NAME or MONGODB_URI_OPTIONS in environment variables."
            );
        }
        // Attempt to connect to MongoDB
        const mongoDBconnection = await mongoose.connect(
            MONGODB_URI + DB_NAME + MONGODB_URI_OPTIONS
        );

        // Log successful connection details
        console.info(`\nMongoDB Connected Successfully:
          Host Name : ${mongoDBconnection.connection.host}
          Database Name : ${mongoDBconnection.connection.name}
          Connection String : ${mongoDBconnection.connection._connectionString}`);

        return true; // Return true if connection is successful
    } catch (error) {
        // Log error details if connection fails
        console.error(`\nMongoDB Connection Failed!
            ${error.name}
            ${error.message}`);
        return false; // Return false if connection fails
    }
};
export default mongoose;
