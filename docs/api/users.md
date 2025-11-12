# User API Documentation

**This document provides comprehensive guidance for all API endpoints defined in your `user.controller.js` file.**

**It covers user listing with optional pagination, fetching a single user by ID, updating user details, and deleting a user.**

-   Ensure your server imports **`user.controller.js`** and sets up corresponding route handlers

    -   (e.g., in `/routers/user.routes.js`).

-   Configure the JWT validation middleware to populate `req.user.sub` (user ID) and `req.user.role` correctly.
-   In your **User** model, verify these fields exist:

    -   `firstName`, `lastName`, `email`, `mobileNumber`, `password`, `role`, `dateOfBirth`, `gender`, `address`, `seatPreference`, `mealPreference`, etc.
    -   Set `select: false` on the `password` field to prevent it from being returned by default.

-   Include ObjectId validation utility (`isValidObjectId`) to ensure valid MongoDB Object IDs.

---

## 🔍 Endpoints

### 1. Get All Users

**Description:**
Retrieves a list of all users. Supports optional pagination via `page` and `limit` query parameters. If no query parameters are provided, returns all users with a single `meta.totalUsers` count.

-   **Endpoint:**

    ```http
    GET http://localhost:3000/api/v1/users
    ```

-   **Headers:**

    ```http
    Authorization: Bearer <jwt-token>
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "Users fetched successfully",
        "meta": {
            "totalUsers": 31
        },
        "data": [
            /* Array of user objects */
        ]
    }
    ```

-   **Query Parameters (optional):**

    | Parameter | Type   | Description              |
    | --------- | ------ | ------------------------ |
    | `page`    | Number | Page number to retrieve  |
    | `limit`   | Number | Number of users per page |

-   **Endpoint:**

    ```http
    GET http://localhost:3000/api/v1/users?page=5&limit=7
    ```

-   **Headers:**

    ```http
    Authorization: Bearer <jwt-token>
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "Users fetched successfully",
        "meta": {
            "totalUsers": 31,
            "totalPages": 5,
            "page": 5,
            "limit": 7,
            "hasNextPage": false,
            "hasPreviousPage": true
        },
        "data": [
            /* Array of user objects */
        ]
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – Invalid `page` or `limit` values

    ```json
    GET http://localhost:3000/api/v1/users

    {
      "status": "forbidden",
      "currentRoles": "user",
      "message": "Access denied. Required role(s): (admin)"
    }
    ```

    -   `400 Bad Request` – Invalid `page` or `limit` values

    ```json
    GET http://localhost:3000/api/v1/users?page=ABC&limit=XYZ

    ?page=ABC&limit=XYZ

    {
      "status": "bad request",
      "message": "Invalid page or limit. Please double-check your input."
    }
    ```

-   `400 Bad Request` – Requested page exceeds total pages

    ```json
    GET http://localhost:3000/api/v1/users?page=5&limit=20

    ?page=5&limit=20

    {
      "status": "bad request",
      "totalUsers": 31,
      "totalPages": 2,
      "message": "Oops! We only have 2 pages. Please pick a valid one."
    }
    ```

-   `400 Bad Request` – `limit` greater than total users

    ```json
    GET http://localhost:3000/api/v1/users?page=1&limit=50

    ?page=1&limit=50

    {
      "status": "bad request",
      "totalUsers": 31,
      "totalPages": 1,
      "message": "Limit too high! There are only 32 users available."
    }
    ```

-   `500 Internal Server Error`

    ```json
    {
        "status": "error",
        "message": "Error message here"
    }
    ```

### 2. Get User By ID

**Description:**
Fetches a single user by their ObjectId. Only the logged-in user or an admin can access another user’s profile.

-   **Endpoint:**

    ```http
    GET http://localhost:3000/api/v1/users/:id
    ```

-   **Headers:**

    ```http
    Authorization: Bearer <jwt-token>
    ```

-   **Route Parameters:**

    | Parameter | Type   | Description                            |
    | --------- | ------ | -------------------------------------- |
    | `id`      | String | MongoDB ObjectId of the requested user |

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "User fetched successfully",
        "data": {
            /* User object */
        }
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – Invalid User Id

        ```json
        {
            "status": "failed",
            "message": "Invalid User ID"
        }
        ```

    -   `403 Forbidden` – Insufficient permissions

        ```json
        {
            "status": "forbidden",
            "message": "Insufficient permissions to fetch this profile"
        }
        ```

    -   `404 Not Found` – User not found

        ```json
        {
            "status": "failed",
            "message": "User not found"
        }
        ```

    -   `500 Internal Server Error`

        ```json
        {
            "status": "error",
            "message": "Error message here"
        }
        ```

---

### 3. Update User By ID

**Description:**
Updates a user’s details by ObjectId. Only the logged-in user or an admin may update the profile. Certain sensitive fields (`password`, `role`, `isBlocked`, `bookings`) cannot be updated via this endpoint.

-   **Endpoint:**

    ```http
    PUT http://localhost:3000/api/v1/users/:id
    ```

-   **Headers:**

    ```http
    Content-Type: application/json

    Authorization: Bearer <jwt-token>
    ```

-   **Route Parameters:**

    | Parameter | Type   | Description                            |
    | --------- | ------ | -------------------------------------- |
    | `id`      | String | MongoDB ObjectId of the user to update |

-   **Request Body:**

    Only the following fields may be updated:

    ```json
    {
        "firstName": "NewFirstName",
        "lastName": "NewLastName",
        "email": "new.email@example.com",
        "mobileNumber": "9123456780",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "profilePicUrl": "https://.../pic.jpg",
        "address": {
            /* address object */
        },
        "seatPreference": "window",
        "mealPreference": "veg"
    }
    ```

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "data": {
            /* Updated user object */
        }
    }
    ```

-   **Error Responses:**

    -   `400 Bad Request` – Invalid fields in request body

        ```json
        {
            "status": "failed",
            "message": "Invalid fields in update request"
        }
        ```

    -   `403 Forbidden` – Not allowed to update this profile

        ```json
        {
            "status": "forbidden",
            "message": "Not allowed to update this profile"
        }
        ```

    -   `404 Not Found` – User not found

        ```json
        {
            "status": "failed",
            "message": "User not found"
        }
        ```

    -   `500 Internal Server Error`

        ```json
        {
            "status": "error",
            "message": "Error message here"
        }
        ```

---

### 4. Delete User

**Description:**
Permanently deletes a user by their ObjectId. Requires a valid ObjectId.

-   **Endpoint:**

    ```http
    DELETE http://localhost:3000/api/v1/users/:id
    ```

-   **Headers:**

    ```http
    Authorization: Bearer <jwt-token>
    ```

-   **Route Parameters:**

    | Parameter | Type   | Description                            |
    | --------- | ------ | -------------------------------------- |
    | `id`      | String | MongoDB ObjectId of the user to delete |

-   **Success Response:** `200 OK`

    ```json
    {
        "status": "success",
        "message": "User deleted successfully"
    }
    ```

-   **Error Responses:**

    -   `404 Not Found` – User not found

        ```json
        {
            "status": "success",
            "message": "User deleted successfully"
        }
        ```

    -   `500 Internal Server Error`

        ```json
        {
            "status": "error",
            "message": "Error message here"
        }
        ```

---

### **Note:**

Implement JWT validation middleware before these routes to ensure only authenticated users can access protected endpoints. Ensure `isValidObjectId` is applied on routes with `:id` parameters to validate incoming Object IDs.
