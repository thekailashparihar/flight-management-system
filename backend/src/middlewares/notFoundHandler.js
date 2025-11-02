// 404 Route Not Found Handler

const notFoundHandler = (req, res) => {
    // Get the full URL that the user requested
    // This includes protocol (http/https), host (like localhost:7000), and the full path with query (like /api/v1/user?id=5)
    const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    console.log(`404 Route Not Found => (${fullUrl})`);

    res.status(404).json({
        status: "failed",
        request: fullUrl,
        message: "404 Route Not Found",
    });
};

export default notFoundHandler;
