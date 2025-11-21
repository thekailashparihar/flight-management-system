import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

// Protected Routes
export const ProtectedRoutes = () => {
    const { loading, isAuthenticated } = useContext(AuthContext);

    if (loading) return <p>Checking Authentication...</p>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Routes
export const PublicRoutes = () => {
    const { loading, isAuthenticated } = useContext(AuthContext);

    if (loading) return <p>Checking Authentication...</p>;

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
