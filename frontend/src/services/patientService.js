import axios from 'axios';

// Get the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Gets all patients assigned to the logged-in nurse
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} - List of patients
 */
const getPatients = async (token) => {
    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await axios.get(`${API_URL}/patients`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error("Error fetching patients:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
};

/**
 * Gets a single patient by ID
 * @param {number} patientId - The patient's ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<Object>} - Patient object
 */
const getPatientById = async (patientId, token) => {
    if (!patientId) {
        throw new Error('Patient ID is required.');
    }
    
    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await axios.get(`${API_URL}/patients/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error("Error fetching patient:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        throw new Error(error.response?.data?.message || 'Failed to fetch patient');
    }
};

export {
    getPatients,
    getPatientById
};
