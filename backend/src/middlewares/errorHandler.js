const errorHandler = (err, req, res, next) => {
    // Log full error stack for debugging
    console.error(err.stack);

    // Determine HTTP status code (default to 500)
    const status = err.statusCode || 500;

    // Send JSON error response
    return res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export default errorHandler;
