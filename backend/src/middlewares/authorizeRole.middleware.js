const authorizeUserRoles = (allowedRoles) => {
    return (req, res, next) => {
        // To make sure the authMiddleware has set req.user.role first
        const userRole = req.user && req.user.role;
        if (!userRole) {
            // If the role is not found, it means the user is not logged in or the token is invalid
            return res.status(401).json({
                status: "unauthorized",
                message: "Authentication required. Please login first.",
            });
        }

        // check User Roles or Allowed Roles are equalls
        if (!allowedRoles.includes(userRole)) {
            // Access will be denied if the role doesn't match
            return res.status(403).json({
                status: "forbidden",
                currentRoles: userRole,
                message: `Access denied. Required role(s): (${allowedRoles.join(
                    ", "
                )})`,
            });
        }

        // Role matching is complete: send the request to the next handler
        next();
    };
};

export default authorizeUserRoles;
