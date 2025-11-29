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

        setError("");
        setSuccess(false);

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
                const serverMsg = (body && (body.message || body.error)) || res.statusText || "Login failed";
                setError(serverMsg);
                return;
            }

            console.log("Server Ka Login response", body); // For debugging

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
        <div className="flex items-center justify-center bg-slate-100 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8">
                {logoutMessage && (
                    <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                        {logoutMessage}
                    </p>
                )}

                <h2 className="text-2xl font-semibold text-center text-slate-800 mb-1">Login</h2>
                <p className="text-sm text-center text-slate-500 mb-6">Sign in to continue</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submiting}
                        className="w-full flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                        {submiting ? "Logging..." : "Login"}
                    </button>

                    {error && (
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                            {userResponse}
                        </p>
                    )}

                    <p className="text-sm text-center text-slate-600 mt-2">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
