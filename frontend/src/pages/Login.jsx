import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [submiting, setSubmiting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [userResponse, setUserResponse] = useState("");

    const { login, logoutMessage, setLogoutMessage } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((formData) => ({ ...formData, [name]: value }));
    };

    const validate = (data) => {
        if (!data.email || !data.password) return "Please fill all required fields.";
        if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Enter a valid email.";
        if (data.password.length < 8) return "Password must be at least 8 characters.";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(""); // clear previous errors
        setSuccess(false); // reset success state

        const validateData = validate(formData);

        if (validateData) {
            setError(validateData);
            return;
        }
        try {
            setSubmiting(true);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const body = await res.json();

            if (!res.ok) {
                // Prefer message from server if present
                const serverMsg = (body && (body.message || body.error)) || res.statusText || "Login failed";
                setError(serverMsg);
                return;
            }

            console.log("Server Ka Login response", body);

            setUserResponse(body.message);

            setSuccess(true);
            login();
            navigate("/dashboard");

            setFormData(() => ({ email: "", password: "" }));
        } catch (error) {
            console.log(error);
            setError(error.message);
        } finally {
            setSubmiting(false);
        }
    };

    useEffect(() => {
        if (!logoutMessage) return;

        const timer = setTimeout(() => {
            setLogoutMessage("");
        }, 5000);

        return () => clearTimeout(timer);
    }, [logoutMessage]);

    return (
        <>
            {logoutMessage && <p style={{ color: "green" }}>{logoutMessage}</p>}

            <form className="form" onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    required
                />
                <button type="submit" disabled={submiting}>
                    {submiting ? " Logging..." : "Login"}
                </button>

                {error && <p style={{ color: "red" }}>{error}</p>}

                {success && <p style={{ color: "green" }}>{userResponse}</p>}

                <p>
                    If you not have Account <Link to="/signup">Sign Up</Link>
                </p>
                <br />
            </form>
        </>
    );
};

export default Login;
