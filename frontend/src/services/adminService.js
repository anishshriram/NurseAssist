import axios from 'axios';

// Base URL for API requests (read from environment variable)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
    // Detailed logging for debugging
    console.log('Creating patient with data:', patientData);
    console.log('Token is present:', !!token);
    console.log('API URL:', `${API_URL}/patients`);
    
    // Log the exact types of each field to help debug type issues
    console.log('Data types:', {
      name: typeof patientData.name,
      age: typeof patientData.age,
      gender: typeof patientData.gender,
      medical_history: typeof patientData.medical_history,
      doctor_id: typeof patientData.doctor_id,
      nurse_id: typeof patientData.nurse_id
    });
    
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
    
    console.log('Patient creation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Response data:', error.response?.data);
    console.error('Status:', error.response?.status);
    
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create patient';
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    
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
      `${API_URL}/logs`,
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

/**
 * Get all doctors for doctor assignment
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing doctors list
 */
export const getDoctorsApi = async (token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/users/doctors`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch doctors';
    console.error('Error fetching doctors:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Get all nurses for nurse assignment
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing nurses list
 */
export const getNursesApi = async (token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/users/nurses`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch nurses';
    console.error('Error fetching nurses:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Delete a patient
 * @param {number} patientId - The ID of the patient to delete
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The response data
 */
export const deletePatientApi = async (patientId, token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    console.log(`Deleting patient ${patientId}`);

    const response = await axios.delete(
      `${API_URL}/patients/${patientId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Patient deletion response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting patient:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete patient');
  }
};

/**
 * Get all API logs
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing all logs
 */
export const getAllApiLogsApi = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/logs`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('API logs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching API logs:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch API logs');
  }
};

/**
 * Get API log by ID
 * @param {number} logId - ID of the log to fetch
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing the log
 */
export const getApiLogByIdApi = async (logId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/logs/${logId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('API log response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching API log:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch API log');
  }
};

/**
 * Get API logs for a specific diagnosis
 * @param {number} diagnosisId - ID of the diagnosis
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing logs for the diagnosis
 */
export const getApiLogsByDiagnosisIdApi = async (diagnosisId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/logs/diagnosis/${diagnosisId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Diagnosis API logs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis API logs:', error.response ? error.response.data : error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch diagnosis API logs');
  }
};
