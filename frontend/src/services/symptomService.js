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

/**
 * Calls the backend /api/diagnosis endpoint to get the next step in the diagnosis.
 * @param {string} sex - Patient's sex ('male' or 'female').
 * @param {number} age - Patient's age.
 * @param {Array<Object>} evidence - Array of symptom evidence objects (e.g., [{ id: 's_21', choice_id: 'present' }]).
 * @param {string} interviewId - The unique ID for the diagnostic interview session.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Object>} - A promise that resolves to the diagnosis response object from Infermedica.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getDiagnosisApi = async (sex, age, evidence, interviewId, token) => {
    // Log input parameters in detail
    console.log(">>> getDiagnosisApi: Input parameters:", { 
        sex, 
        age, 
        evidence: JSON.stringify(evidence), 
        interviewId, 
        hasToken: !!token 
    });

    // Validate inputs with detailed logging
    if (!sex) {
        console.error(">>> getDiagnosisApi: Missing 'sex' parameter");
        throw new Error('Missing sex parameter for diagnosis request.');
    }
    if (!age) {
        console.error(">>> getDiagnosisApi: Missing 'age' parameter");
        throw new Error('Missing age parameter for diagnosis request.');
    }
    if (!evidence || !Array.isArray(evidence)) {
        console.error(">>> getDiagnosisApi: Evidence is missing or not an array:", evidence);
        throw new Error('Evidence must be provided as an array.');
    }
    if (evidence.length === 0) {
        console.error(">>> getDiagnosisApi: Evidence array is empty");
        throw new Error('At least one evidence item is required.');
    }
    if (!interviewId) {
        console.error(">>> getDiagnosisApi: Missing 'interviewId' parameter");
        throw new Error('Missing interviewId for diagnosis request.');
    }
    if (!token) {
        console.error(">>> getDiagnosisApi: Missing authentication token");
        throw new Error('Authentication token is missing.');
    }

    // Validate evidence structure
    evidence.forEach((item, index) => {
        if (!item.id || !item.choice_id) {
            console.error(`>>> getDiagnosisApi: Invalid evidence item at index ${index}:`, item);
            throw new Error(`Evidence item at index ${index} is missing required properties.`);
        }
    });

    try {
        // Prepare the request body according to Infermedica /diagnosis spec
        const requestBody = {
            sex: sex,
            age: { 
                value: parseInt(age, 10) // Ensure age is an integer
                // 'unit' will be added by backend if needed 
            },
            evidence: evidence,
            // extras can be added here if needed later, e.g., { 'disable_groups': true }
        };

        console.log(`>>> getDiagnosisApi: Request body:`, JSON.stringify(requestBody, null, 2));
        console.log(`>>> getDiagnosisApi: Calling POST ${API_URL}/diagnosis with Interview-ID: ${interviewId}`);
        
        // Remember that Infermedica requires specific parameter formats
        // Let's log the exact stringified request for debugging
        const requestStr = JSON.stringify(requestBody);
        console.log(`>>> getDiagnosisApi: EXACT request JSON string: ${requestStr}`);
        
        const response = await axios.post(`${API_URL}/diagnosis`, requestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Interview-ID': interviewId, // Pass the interview ID header
                'Content-Type': 'application/json' // Standard for POST
            }
        });

        console.log(`>>> getDiagnosisApi: Received successful response:`, {
            questionType: response.data.question?.type || 'No question',
            questionText: response.data.question?.text?.substring(0, 50) || 'No question text',
            conditionsCount: response.data.conditions?.length || 0,
            shouldStop: response.data.should_stop
        });

        // Return the diagnosis result from the response
        return response.data;

    } catch (error) {
        console.error(">>> getDiagnosisApi: Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data,
            requestData: error.config?.data
        });
        
        const errorMessage = error.response?.data?.errors?.[0]?.message || // Zod error
                             error.response?.data?.message || // General backend error
                             'Failed to get diagnosis';      // Fallback
        throw new Error(errorMessage);
    }
};
/**
 * Saves a diagnosis result to the database
 * @param {number} patientId - The patient's ID.
 * @param {string} conditionId - The condition ID from Infermedica (e.g., 'c_87').
 * @param {string} conditionName - The name of the condition.
 * @param {number} confidenceScore - The probability/confidence score (0-100).
 * @param {boolean} criticalFlag - Whether this is a critical condition requiring urgent attention.
 * @param {Array<Object>} symptoms - Array of symptoms that led to this diagnosis.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Object>} - A promise that resolves to the diagnosis save response.
 * @throws {Error} - Throws an error if the API call fails.
 */
const saveDiagnosisApi = async (patientId, conditionId, conditionName, confidenceScore, criticalFlag, symptoms, token) => {
    if (!patientId || !conditionId || !conditionName || confidenceScore === undefined || !Array.isArray(symptoms)) {
        console.error(">>> saveDiagnosisApi: Missing required parameters:", { 
            hasPatientId: !!patientId, 
            hasConditionId: !!conditionId, 
            hasConditionName: !!conditionName,
            confidenceScore,
            symptomsCount: symptoms?.length
        });
        throw new Error('Missing required parameters for saving diagnosis.');
    }

    if (!token) {
        console.error(">>> saveDiagnosisApi: Missing authentication token");
        throw new Error('Authentication token is missing.');
    }

    try {
        // Format symptoms for storage - ensure no null values for required fields
        const formattedSymptoms = symptoms.map(symptom => {
            // Log each symptom to help debug any null values
            console.log('Processing symptom:', symptom);
            
            // Create object with required fields, ensuring non-null values and using the new infermedica_id field
            const formattedSymptom = {
                infermedica_id: symptom.id || '', // Infermedica ID (e.g., s_98)
                name: symptom.name || symptom.common_name || `Symptom ${symptom.id || 'unknown'}`, // Required string
                severity: symptom.severity || 'moderate' // Required enum value
            };
            
            // Only add duration if it's a non-null string (it's optional in schema)
            if (symptom.duration && typeof symptom.duration === 'string') {
                formattedSymptom.duration = symptom.duration;
            }
            
            // Remove any properties not in the backend schema
            delete formattedSymptom.type; // Just in case this was added
            
            return formattedSymptom;
        });

        const requestBody = {
            patient_id: parseInt(patientId, 10),
            condition_id: conditionId,
            condition_name: conditionName,
            confidence_score: confidenceScore,
            critical_flag: criticalFlag || false,
            symptoms: formattedSymptoms
        };

        console.log(`>>> saveDiagnosisApi: Saving diagnosis with:`, JSON.stringify(requestBody, null, 2));

        const response = await axios.post(`${API_URL}/diagnosis/save`, requestBody, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`>>> saveDiagnosisApi: Diagnosis saved successfully:`, response.data);
        return response.data;

    } catch (error) {
        console.error(">>> saveDiagnosisApi: Error saving diagnosis:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        const errorMessage = error.response?.data?.errors?.[0]?.message || 
                             error.response?.data?.message || 
                             'Failed to save diagnosis';
        throw new Error(errorMessage);
    }
};

/**
 * Get all diagnoses for a specific patient
 * @param {number} patientId - The patient's ID.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array>} - A promise that resolves to an array of diagnosis objects.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getPatientDiagnosesApi = async (patientId, token) => {
    if (!patientId) {
        console.error(">>> getPatientDiagnosesApi: Missing patient ID");
        throw new Error('Patient ID is required.');
    }

    if (!token) {
        console.error(">>> getPatientDiagnosesApi: Missing authentication token");
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await axios.get(`${API_URL}/diagnosis/patient/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        console.error(">>> getPatientDiagnosesApi: Error fetching diagnoses:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        const errorMessage = error.response?.data?.message || 'Failed to fetch patient diagnoses';
        throw new Error(errorMessage);
    }
};

/**
 * Get all diagnoses for patients assigned to the doctor
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Array>} - A promise that resolves to an array of diagnosis objects.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getDoctorDiagnosesApi = async (token) => {
    if (!token) {
        console.error(">>> getDoctorDiagnosesApi: Missing authentication token");
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await axios.get(`${API_URL}/diagnosis/doctor`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;

    } catch (error) {
        console.error(">>> getDoctorDiagnosesApi: Error fetching diagnoses:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        const errorMessage = error.response?.data?.message || 'Failed to fetch doctor diagnoses';
        throw new Error(errorMessage);
    }
};

/**
 * Confirm or reject a diagnosis by a doctor
 * @param {number} diagnosisId - The ID of the diagnosis to confirm/reject.
 * @param {boolean} confirmed - Whether the doctor confirms (true) or rejects (false) the diagnosis.
 * @param {string} token - The JWT authentication token.
 * @returns {Promise<Object>} - A promise that resolves to the confirmation response.
 * @throws {Error} - Throws an error if the API call fails.
 */
const confirmDiagnosisApi = async (diagnosisId, confirmed, token) => {
    if (!diagnosisId) {
        console.error(">>> confirmDiagnosisApi: Missing diagnosis ID");
        throw new Error('Diagnosis ID is required.');
    }

    if (typeof confirmed !== 'boolean') {
        console.error(">>> confirmDiagnosisApi: 'confirmed' must be a boolean");
        throw new Error('Confirmation status must be a boolean value.');
    }

    if (!token) {
        console.error(">>> confirmDiagnosisApi: Missing authentication token");
        throw new Error('Authentication token is missing.');
    }

    try {
        const response = await axios.patch(`${API_URL}/diagnosis/${diagnosisId}/confirm`, 
            { confirmed }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(">>> confirmDiagnosisApi: Error confirming diagnosis:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            responseData: error.response?.data
        });
        
        const errorMessage = error.response?.data?.message || 'Failed to confirm diagnosis';
        throw new Error(errorMessage);
    }
};

export { 
    searchSymptomsApi, 
    getDiagnosisApi,
    saveDiagnosisApi,
    getPatientDiagnosesApi,
    getDoctorDiagnosesApi,
    confirmDiagnosisApi 
};
