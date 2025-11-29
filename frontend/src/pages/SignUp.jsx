import { useState, useRef, useEffect, useCallback, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
    // Form state - holds all user input data
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        password: "",
    });

    const [error, setError] = useState(""); // Error message display
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevents double submission
    const [success, setSuccess] = useState(false); // Track if signup was successful
    const [userResponse, setUserResponse] = useState(""); // Success message from server

    // useRef keeps a reference to formData that updates instantly without re-render
    // This is used in handleSubmit to get the latest form values
    const formRef = useRef(formData);

    // Get login function from context to update global auth state after signup
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Keep formRef.current in sync with formData state
    // Jab bhi formData change ho, formRef.current ko update kar do
    useEffect(() => {
        formRef.current = formData;
    }, [formData]);

    // useCallback prevents function recreation on every render (performance optimization)
    // Yeh function input field mein typing hote samay call hota hai
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Validation function - checks if all required fields are filled and valid
    const validate = (data) => {
        // Check if required fields are empty
        if (!data.firstName || !data.email || !data.mobileNumber || !data.password) {
            return "Please fill all required fields.";
        }

        if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Enter a valid email.";
        if (!/^[0-9]{10,15}$/.test(data.mobileNumber)) return "Enter a valid phone number.";
        if (data.password.length < 8) return "Password must be at least 8 characters.";

        // Return empty string if all validations pass
        return "";
    };

    // Main form submission handler
    const handleSubmit = useCallback(async (e) => {
        // Prevent page reload on form submission
        e.preventDefault();

        // Clear previous error/success messages
        setError("");
        setSuccess(false);

        // Get form data from ref (always has latest values)
        const data = formRef.current;
        const validationError = validate(data);

        // If validation fails, show error and stop submission
        if (validationError) {
            setError(validationError);
            return;
        }

        // Show loading state (button text changes to "Signing up...")
        setIsSubmitting(true);

        try {
            // Send signup request to backend API
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
                method: "POST", // Use POST to send data to server
                headers: { "Content-Type": "application/json" }, // Tell server data format is JSON
                body: JSON.stringify(data), // Convert JavaScript object to JSON string
                credentials: "include", // Send cookies for session management (important for auth)
            });

            // Check if response status is not OK 
            if (!res.ok) {
                let serverMsg = res.statusText; 

                try {
                    // Try to extract detailed error message from response JSON
                    const json = await res.json();
                    serverMsg = json?.message || serverMsg; // Use server's custom message if available
                } catch {
                    // If response is not valid JSON, just use statusText as fallback
                }

                // Throw error to go to catch block below
                throw new Error(serverMsg || "Signup failed");
            }

            // Parse successful response JSON
            const body = await res.json();
            console.log("Server Ka Signup response", body); // For debugging

            // Show success message from server response
            setUserResponse(body?.message || "Signup successful!");
            setSuccess(true);

            // Clear form fields after successful signup
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                mobileNumber: "",
                password: "",
            });

            // Update global auth context to mark user as logged in
            login();

            // Wait 1.5 seconds before redirecting
            // Yeh time user ko success message dekh paayein
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch (err) {
            // Handle any errors from API call or validation
            setError(err.message || "Something went wrong");
        } finally {
            // Always stop loading state - yeh code success ya error dono case mein chalega
            setIsSubmitting(false);
        }
    }, []);

    return (
        <div className="flex items-center justify-center bg-slate-100 min-h-[calc(100vh-120px)]">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8">
                <h2 className="text-2xl font-semibold text-center text-slate-800 mb-1">Sign Up</h2>
                <p className="text-sm text-center text-slate-500 mb-6">Create your account to get started</p>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {/* First Name & Last Name - 2 columns on desktop, 1 on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                First Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                required
                                aria-label="First name"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name (optional)"
                                aria-label="Last name"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Email input field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            aria-label="Email"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Mobile number input field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Mobile Number<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Mobile number"
                            maxLength={15}
                            required
                            aria-label="Mobile number"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Password input field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            aria-label="Password"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="mt-1 text-xs text-slate-400">Minimum 8 characters required.</p>
                    </div>

                    {/* Submit button - disabled state while submitting */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                        {isSubmitting ? "Signing up..." : "Sign Up"}
                    </button>

                    {/* Error message display - only shows when error state is set */}
                    {error && (
                        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Success message display - only shows when signup succeeds */}
                    {success && (
                        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                            {userResponse}
                        </p>
                    )}

                    {/* Link to login page for existing users */}
                    <p className="text-sm text-center text-slate-600 mt-2">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
