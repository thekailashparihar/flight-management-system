# Authentication API Documentation

**This document provides comprehensive guidance for all API endpoints defined in your `auth.controller.js` file.**

**It covers user signup, login, logout, forgot password, reset password, and profile retrieval.**

-   Ensure your server imports **`auth.controller.js`** and sets up corresponding route handlers

    -   (e.g., in `/routers/auth.routes.js`).

-   Configure the JWT token generation utility (`generateToken`) and cookie settings (`cookie.config.js`) correctly.

-   In your **User** model, verify these fields exist:

    -   `firstName`, `lastName`, `email`, `mobileNumber`, `password`, `role`, `dateOfBirth`, `gender`, `address`, etc.
    -   Set `select: false` on the `password` field to prevent it from being returned by default.
    -   Include reset token fields: `resetPasswordToken`, `resetPasswordTokenExpires`.

---

## 🔐 Endpoints

### 1. User Signup

**Description:**  
Registers a new user with the provided personal, contact, and address details.

---

-   **Endpoint:**

    ```http
    POST http://localhost:3000/api/v1/auth/signup
    ```

-   **Headers:**

    ```http
    Content-Type: application/json
    ```

-   **Request Body:**

    ```json
    {
        "firstName": "Isha",
        "lastName": "Verma",
        "email": "isha.verma@yahoo.com",
        "mobileNumber": "9876543211",
        "dateOfBirth": "1992-04-15",
        "gender": "female",
        "password": "Isha@123!",
        "address": {
            "street": "Civil Lines",
            "city": "Jaipur",
            "district": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302001",
            "country": "India"
        },
        "seatPreference": "aisle",
        "mealPreference": "jain"
    }
    ```

-   **Success Response:** `201 Created`

    ```json
    {
        "status": "success",
        "message": "Congratulations! Isha Verma, your account has been created successfully."
    }
    ```

-   **Error Responses:**

-   `409 Conflict` – If both email and mobile number are found to be duplicate

    ```json
    {
        "status": "conflict",
        "message": "An account already exists with this email isha.verma@yahoo.com and mobile number 9876543211"
    }
    ```

-   `409 Conflict` – If only email is found to be duplicate

    ```json
    {
        "status": "conflict",
        "message": "An account already exists with this email isha.verma@yahoo.com"
    }
    ```

-   `409 Conflict` – If only the mobile number is found to be duplicate

    ```json
    {
        "status": "conflict",
        "message": "An account already exists with this mobile number 9876543211"
    }
    ```

-   `500 Internal Server Error`

    ```json
    {
        "status": "error",
        "message": "User registration failed",
        "error": "ErrorName",
        "details": "ErrorMessage"
    }
    ```

---

### 2. User Login

**Description:**  
Logs in a user using either email or mobile number and password.

---

-   **Endpoint:**

    ```http
    POST http://localhost:3000/api/v1/auth/login
    ```

-   **Headers:**

    ```http
    Content-Type: application/json
    ```

-   **Request Body:**

    -   **By email:**

    ```json
    {
        "email": "isha.verma@yahoo.com",
        "password": "Isha@123!"
    }
    ```

    -   **By mobile number:**

    ```json
    {
        "mobileNumber": "9876543211",
        "password": "Isha@123!"
    }
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "Welcome back, Isha! You have logged in successfully."
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – If user login with both email and mobile number simultaneously then

    ```json
    {
        "status": "failed",
        "message": "Please provide either email or mobile number, not both."
    }
    ```

    -   `422 Unprocessable Entity` – If the user login without password,

    ```json
    {
        "status": "failed",
        "message": "Password is required."
    }
    ```

    -   `401 Unauthorized` – If the user is not found, then

    ```json
    {
        "status": "failed",
        "message": "User not found!"
    }
    ```

    -   `401 Unauthorized` – If the user login with the wrong password,

    ```json
    {
        "status": "failed",
        "message": "Invalid Password"
    }
    ```

-   `500 Internal Server Error`

    ```json
    {
        "status": "error",
        "message": "Logout failed",
        "error": "ErrorName",
        "details": "ErrorMessage"
    }
    ```

---

### 3. User Logout

**Description:**  
Logout a user uing this api

---

-   **Endpoint:**

    ```http
    POST http://localhost:3000/api/v1/auth/logout
    ```

    _Or `POST` depending on your router configuration._

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "User logged out successfully"
    }
    ```

-   **Error Response:** `401 Unauthorised` If the user is already logged out,

    ```json
    {
        "status": "unauthorized",
        "message": "No token provided, please login first"
    }
    ```

-   **Error Response:** `500 Internal Server Error`

    ```json
    {
        "status": "failed",
        "message": "Logout failed",
        "error": "ErrorName",
        "details": "ErrorMessage"
    }
    ```

---

### 4. Forgot Password

**Description:**  
Forgot Password using either email or mobile number

---

-   **Endpoint:**

    ```http
    POST http://localhost:3000/api/v1/auth/forgot-password
    ```

-   **Headers:**

    ```http
    Content-Type: application/json
    ```

-   **Request Body:**

    -   **By email:**

    ```json
    {
        "email": "isha.verma@yahoo.com"
    }
    ```

    -   **By mobile number:**

    ```json
    {
        "mobileNumber": "9876543211"
    }
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "Password Reset token generated",
        "token": "0168530c-5bc5-4a7d-99ac-7be489344b62"
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – If user tries to forget password using both email and mobile number simultaneously then

    ```json
    {
        "status": "failed",
        "message": "Please provide either email or mobile number, not both."
    }
    ```

    -   `404 Not Found` – User not found:

    ```json
    {
        "status": "failed",
        "message": "User not found with given email or mobile number."
    }
    ```

    -   `500 Internal Server Error`

    ```json
    {
        "status": "error",
        "message": "Unable to process your request at this time. Please try again later.",
        "error": "ErrorName",
        "details": "ErrorMessage"
    }
    ```

---

### 5. Reset Password

**Description:**  
Reset Password using token or New Password

---

-   **Endpoint:**

    ```http
    POST http://localhost:3000/api/v1/auth/reset-password
    ```

-   **Headers:**

    ```http
    Content-Type: application/json
    ```

-   **Request Body:**

    ```json
    {
        "token": "0168530c-5bc5-4a7d-99ac-7be489344b62",
        "newPassword": "NewPass@123!"
    }
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "Password reset successful"
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – If the user provides weak password then

    ```json
    {
        "status": "failed",
        "message": "Password must be at least 8 characters long"
    }
    ```

    -   `400 Bad Request` – If user provides invalid or expired token

    ```json
    {
        "status": "failed",
        "message": "Invalid or expired token"
    }
    ```

    -   `500 Internal Server Error`

    ```json
    {
        "status": "error",
        "message": "Unable to process your request at this time. Please try again later.",
        "error": "ErrorName",
        "details": "ErrorMessage"
    }
    ```

---

### 6. Get Logged-In User Profile

**Description:**  
Get the logged in user profile

---

-   **Endpoint:**

    ```http
    GET http://localhost:3000/api/v1/auth/profile
    ```

-   **Headers:**

    ```http
    Authorization: Bearer <jwt-token>
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "user": {
            "_id": "686fe54ebd3f9b9ef303b727",
            "firstName": "Isha",
            "lastName": "Verma",
            "email": "isha.verma@yahoo.com",
            "mobileNumber": "9876543211",
            "dateOfBirth": "1992-04-15T00:00:00.000Z",
            "gender": "female",
            "role": "user",
            "profilePicUrl": null,
            "address": {
                "street": "Civil Lines",
                "city": "Jaipur",
                "district": "Jaipur",
                "state": "Rajasthan",
                "pincode": "302001",
                "country": "India"
            },
            "bookings": [],
            "seatPreference": "aisle",
            "mealPreference": "jain",
            "isBlocked": false,
            "createdAt": "2025-07-10T16:07:42.282Z",
            "updatedAt": "2025-07-15T22:55:23.010Z",
            "__v": 0
        }
    }
    ```

-   **Error Responses:**

    -   `401 Unauthorized` – If Token is missing

    ```json
    {
        "status": "unauthorized",
        "message": "No token provided, please login first"
    }
    ```

-   `401 Unauthorized` – If token is invalid

    ```json
    {
        "status": "failed",
        "message": "Token expired, please login again"
    }
    ```

    -   `404 Not Found` – User not found:

    ```json
    {
        "status": "failed",
        "message": "User not found"
    }
    ```

    -   `500 Internal Server Error` – Server error:

    ```json
    {
        "status": "error",
        "message": "Internal server error",
        "details": "ErrorMessage"
    }
    ```

### **Note:** Implement JWT validation middleware to ensure that only authenticated users can access protected routes.
