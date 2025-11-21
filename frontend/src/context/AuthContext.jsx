import { createContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export default AuthContext;

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    const [logoutMessage, setLogoutMessage] = useState("");

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    // ye function Header se call hoga
    const handleLogout = (message) => {
        setLogoutMessage(message); // message UI me show karne ke liye
        logout(); // state se user ko logout
    };

    const checkAuthentication = async () => {
        try {
            setLoading(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/profile`, {
                method: "GET",
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Profile:", data);
                login();
            } else {
                logout();
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthentication();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                loading,
                setLoading,
                isAuthenticated,
                login,
                logout,
                logoutMessage,
                setLogoutMessage,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
