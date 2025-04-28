import axios from 'axios';

// Define the base URL for the backend API
// Use the updated port 3001
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Searches for symptoms by calling the backend API.
 * @param {string} phrase - The search term for symptoms.
 * @param {number} age - The patient's age.
 * @param {string} sex - The patient's sex ('male' or 'female').
 * @param {string} interviewId - The unique ID for the diagnostic interview session.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array>} - A promise that resolves to an array of symptom objects.
 * @throws {Error} - Throws an error if the API call fails.
 */
const searchSymptomsApi = async (phrase, age, sex, interviewId, token) => {
    if (!phrase || !age || !sex || !interviewId) {
        // Return early or throw error if required parameters are missing
        console.warn("Missing required parameters for symptom search:", { phrase, age, sex, interviewId });
        return [];
    }
    if (!token) {
        throw new Error('Authentication token is missing.');
    }

    try {
        // Construct the query parameters
        const params = new URLSearchParams();
        params.append('phrase', phrase);
        params.append('age', age.toString()); // Ensure age is sent as string
        params.append('sex', sex);

        const response = await axios.get(`${API_URL}/symptoms/search`, {
            params: params,
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Interview-ID': interviewId // Add the interview ID header
            }
        });

        // Infermedica API might return results directly in response.data
        // or nested (e.g., response.data.symptoms). Adjust as needed.
        return response.data || [];

    } catch (error) {
        console.error("Error searching symptoms:", error.response ? error.response.data : error.message);
        // Propagate specific error message from backend if available
        const errorMessage = error.response?.data?.errors?.[0]?.message || // Zod error message
                             error.response?.data?.message || // General backend error message
                             'Failed to fetch symptoms';      // Fallback message
        throw new Error(errorMessage);
    }
};

export { searchSymptomsApi };
