import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

function Header() {
    const { isAuthenticated, handleLogout } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleClick = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (res.ok) {
                const result = await res.json();
                console.log(result);
                handleLogout(result.message);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
                {/* Brand Logo */}
                <div className="text-xl md:text-2xl font-bold tracking-wide">
                    <Link to="/" className="hover:opacity-90">
                        ⒷⓄⓄⓀⒾⓃⒼ
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden flex items-center justify-center"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <MenuOpenRoundedIcon sx={{ fontSize: 28, color: "white" }} />
                    ) : (
                        <MenuRoundedIcon sx={{ fontSize: 28, color: "white" }} />
                    )}
                </button>

                {/* Navigation Links - Desktop */}
                <nav className="hidden md:flex gap-6 text-xl font-medium">
                    <Link to="/" className="hover:text-yellow-300 transition">
                        Home
                    </Link>
                    <Link to="/about-us" className="hover:text-yellow-300 transition">
                        About Us
                    </Link>
                    <Link to="/contact-us" className="hover:text-yellow-300 transition">
                        Contact Us
                    </Link>
                </nav>

                {/* Auth Buttons - Desktop */}
                <div className="hidden md:flex gap-3">
                    {isAuthenticated ? (
                        <button
                            onClick={handleClick}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 transition rounded-full text-sm"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-white text-purple-700 font-semibold rounded-full hover:bg-gray-200 transition text-sm"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition text-sm"
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white px-4 py-4 space-y-3">
                    <Link
                        to="/"
                        className="block py-2 hover:text-yellow-300 transition text-sm text-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about-us"
                        className="block py-2 hover:text-yellow-300 transition text-sm text-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About Us
                    </Link>
                    <Link
                        to="/contact-us"
                        className="block py-2 hover:text-yellow-300 transition text-sm text-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contact Us
                    </Link>
                    <div className="border-t border-gray-300 pt-3 space-y-2">
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    handleClick();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 transition rounded-full text-sm text-white"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition text-sm text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block w-full px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition text-sm text-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;
