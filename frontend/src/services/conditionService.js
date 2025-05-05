import axios from 'axios';

// Base URL for API requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Get all medical conditions
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing conditions list
 */
export const getAllConditionsApi = async (token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/conditions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch conditions';
    console.error('Error fetching conditions:', errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Get a specific condition by ID
 * @param {number} conditionId - ID of the condition to fetch
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise with API response containing condition details
 */
export const getConditionByIdApi = async (conditionId, token) => {
  if (!token) {
    console.error('Authentication token missing');
    throw new Error('Authentication required. Please login again.');
  }

  try {
    const response = await axios.get(
      `${API_URL}/conditions/${conditionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch condition';
    console.error(`Error fetching condition ${conditionId}:`, errorMsg);
    throw new Error(errorMsg);
  }
};
