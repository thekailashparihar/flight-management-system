import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
    // Get secret key from environment variables
    const secretKey = process.env.JWT_SECRET_KEY;

    // Check if secret key is present
    if (!secretKey) {
        console.error("JWT_SECRET_KEY is not defined");
        return res.status(500).json({
            status: "error",
            message: "JWT Secret Keys is missing in environment variables",
        });
    }

    // Retrieve JWT token from cookies
    const token = req.cookies.jwtAuthToken;

    // If token is not found, return unauthorized
    if (!token) {
        return res.status(401).json({
            status: "unauthorized",
            message: "No token provided, please login first",
        });
    }

    try {
        // Verify the JWT token using the secret key
        const decodedToken = jwt.verify(token, secretKey);

        // Attach decoded user info to request object for use in next middlewares/routes
        req.user = decodedToken;

        // Proceed to next middleware or route handler
        next();
    } catch (error) {
        console.error("JWT verification failed:", error.name, error.message);

        // Handle expired token
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                status: "failed",
                message: "Token expired, please login again",
            });
        }

        // Handle invalid token
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                status: "failed",
                message: "Invalid token, authentication failed",
            });
        }

        // Handle any other authentication error
        return res.status(500).json({
            status: "error",
            message: "Something went wrong during authentication",
        });
    }
};

export default authenticateUser;
