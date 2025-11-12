import { Link } from "react-router-dom";

function Header() {
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
            <div className="login-btn">
                <button>Login</button>
            </div>
        </header>
    );
}

export default Header;
