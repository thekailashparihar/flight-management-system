// Load environment variables from the .env file to process.env
import "./src/config/dotenv.config.js";

// Import the function to initialize and start the server
import startServer from "./src/server.js";

// Start the server
startServer();
