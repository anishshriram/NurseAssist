import axios from 'axios';

// Define the base URL for the backend API
// Use the updated port 3001
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Logs in a user by calling the backend API.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - A promise that resolves to the backend response data (including token, role, name) on success,
 *                             or an object with an 'error' property on failure.
 * @throws {Error} - Can throw an error if the request setup fails (should be caught).
 */
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        // Assuming the backend returns data like { token: '...', role: '...', name: '...' } on success
        console.log("Login API Response:", response.data); // Log successful response
        return response.data; // Return the full data object

    } catch (error) {
        console.error("Login API Error:", error.response ? error.response.data : error.message);
        // Return an object with the error message from the backend, or a generic message
        return { error: error.response?.data?.message || 'Login failed. Please check credentials.' };
    }
};

/**
 * Registers a new user by calling the backend API.
 * @param {string} name - The user's full name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} role - The user's role (e.g., 'Nurse', 'Doctor', 'Admin').
 * @returns {Promise<object>} - A promise that resolves to the backend response data on success,
 *                             or an object with an 'error' property on failure.
 */
export const registerUser = async (name, email, password, role) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
            role,
        });
        // Assuming backend returns a success message or user object (without token)
        console.log("Register API Response:", response.data);
        return response.data; // Or return { message: 'Registration successful!' }

    } catch (error) {
        console.error("Register API Error:", error.response ? error.response.data : error.message);
        // Return an object with the error message
        return { error: error.response?.data?.message || 'Registration failed.' };
    }
};