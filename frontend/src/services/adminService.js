import axios from 'axios';

// Base URL for API requests (read from environment variable)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Create a new patient
 * @param {object} patientData - Patient information (name, age, gender, medical_history)
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response
 */
export const createPatientApi = async (patientData, token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    // Log the request for debugging
    console.log('Creating patient with data:', patientData);
    
    const response = await axios.post(
      `${API_URL}/patients`,
      patientData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create patient';
    console.error('Error creating patient:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Get all patients
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response
 */
export const getAllPatientsApi = async (token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/patients/all`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch patients';
    console.error('Error fetching patients:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Update patient information
 * @param {number} patientId - ID of the patient to update
 * @param {object} patientData - Updated patient data
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response
 */
export const updatePatientApi = async (patientId, patientData, token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.patch(
      `${API_URL}/patients/${patientId}`,
      patientData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update patient';
    console.error('Error updating patient:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Get API logs for admin review
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response
 */
export const getApiLogsApi = async (token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/api_logs`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch API logs';
    console.error('Error fetching API logs:', errorMsg);
    throw new Error(errorMsg);
  }
};
