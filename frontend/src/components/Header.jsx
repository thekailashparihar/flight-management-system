import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

function Header() {
    const { isAuthenticated, handleLogout } = useContext(AuthContext);

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

    return (
        <header>
            <div className="brand-logo">
                <Link to="/">ⒷⓄⓄⓀⒾⓃⒼ</Link>
            </div>
            <div>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/about-us">About Us</Link>
                    <Link to="/contact-us">Contact Us</Link>
                </nav>
            </div>
            <div className="login">
                {isAuthenticated ? (
                    <button onClick={handleClick}>Logout</button>
                ) : (
                    <button>
                        <Link to="/login">Login </Link>
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
