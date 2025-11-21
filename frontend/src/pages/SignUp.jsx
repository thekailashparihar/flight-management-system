import { useState, useRef, useEffect, useCallback, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    // Form data state - stores all user inputs
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        password: "",
    });

    // Error message state - displays validation/server errors to user
    const [error, setError] = useState("");
    // Loading state - disables button during API call
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Success state - shows success message after signup
    const [success, setSuccess] = useState(false);

    const [userResponse, setUserResponse] = useState("");

    // Using ref instead of state to store latest formData without triggering re-renders
    // This is helpful when reading data inside callbacks with empty dependencies
    const formRef = useRef(formData);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Update ref whenever formData changes so handleSubmit always reads latest data
    useEffect(() => {
        formRef.current = formData;
    }, [formData]);

    // Memoized input change handler - updates form data for the changed field
    // useCallback ensures stable reference so it can be used in event listeners without causing re-renders
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        // Functional setState prevents dependency on formData
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Validation function - checks if all required fields are filled and valid
    // Returns error message if validation fails, empty string if all good
    const validate = (data) => {
        // Check if required fields are empty
        if (!data.firstName || !data.email || !data.mobileNumber || !data.password) {
            return "Please fill all required fields.";
        }
        // Email regex validation - checks basic email format (something@something.something)
        if (!/^\S+@\S+\.\S+$/.test(data.email)) return "Enter a valid email.";
        // Phone number validation - allows digits, +, -, (), space (7-15 characters)
        if (!/^[0-9]{10,15}$/.test(data.mobileNumber)) return "Enter a valid phone number.";
        // Password length check - minimum 6 characters required
        if (data.password.length < 8) return "Password must be at least 8 characters.";
        return "";
    };

    // Form submission handler - validates data and sends to backend
    // Empty dependency array means this function reference never changes
    // It reads latest data from formRef.current instead of formData from closure
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            // Clear previous error/success messages
            setError("");
            setSuccess(false);

            // Get latest form data from ref (always current without re-render)
            const data = formRef.current;
            const validationError = validate(data);
            if (validationError) {
                setError(validationError);
                return;
            }

            // Show loading state
            setIsSubmitting(true);
            try {
                // Send signup request to backend API
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    credentials: "include",
                });

                // Handle API errors (non-2xx status codes)
                if (!res.ok) {
                    // Try to get error message from server response
                    let serverMsg = res.statusText;
                    try {
                        const json = await res.json();
                        serverMsg = json?.message || serverMsg;
                    } catch {
                        // If response is not JSON, use default statusText
                    }
                    throw new Error(serverMsg || "Signup failed");
                }

                const body = await res.json();
                if (res.ok) console.log("Server Ka Signup response", body);

                setUserResponse(body);

                // Signup successful - show success message and reset form
                setSuccess(true);
                setFormData({ firstName: "", lastName: "", email: "", mobileNumber: "", password: "" });

                login();

                // setTimeout(() => {
                //     navigate("/dashboard");
                // }, 1000);
            } catch (err) {
                // Show error message to user
                setError(err.message || "Something went wrong");
            } finally {
                // Hide loading state regardless of success or failure
                setIsSubmitting(false);
            }
        },
        [] // Empty dependencies - function never needs to be recreated
    );

    return (
        <form className="form" onSubmit={handleSubmit} noValidate>
            <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                aria-label="First name"
            />

            <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name (optional)"
                aria-label="Last name"
            />

            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                aria-label="Email"
            />

            <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Mobile number"
                maxLength={15}
                required
                aria-label="Mobile number"
            />

            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                aria-label="Password"
            />

            {/* Submit button - disabled during API call to prevent duplicate submissions */}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : "Sign Up"}
            </button>

            {/* Error message display */}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {/* Success message display */}
            {success && <p style={{ color: "green" }}>{userResponse}</p>}

            <br />
        </form>
    );
};

export default SignUp;
