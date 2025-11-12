import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import { establishDBConnection } from "./database/mongodb.config.js";

import apiRouter from "./routes.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";

const server = express();

server.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

const __dirname = path.resolve();

server.use(express.json({ limit: "16kb" }));
server.use(cookieParser());

// Mount all API routes under /api/v1
server.use("/api/v1", apiRouter);

// make ready for deployment
if (process.env.NODE_ENV === "production") {
    server.use(express.static(path.join(__dirname, "../frontend/dist")));

    server.get(/.*/, (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

// Handle 404 - Route not found
server.use(notFoundHandler);

// Global error handler
server.use(errorHandler);

// Start server only after database connection is established
const startServer = async () => {
    try {
        // Establish MongoDB connection
        const isDBConnected = await establishDBConnection();

        if (!isDBConnected) {
            console.error(
                "\nDatabase connection failed. Aborting server startup\n"
            );
            process.exit(1);
        }

        const port = process.env.PORT || 7000;

        // Start the server and listen for incoming requests
        server.listen(port, () => {
            console.info(
                `\nServer is start running at http://localhost:${port}\n`
            );
        });
    } catch (err) {
        console.log("\nServer Startup Failure, Shutting down system\n", err);
        process.exit(1);
    }
};

export default startServer;
