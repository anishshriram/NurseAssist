// /home/adilh/classes/NurseAssist/backend/src/services/infermedicaService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config';
import { v4 as uuidv4 } from 'uuid'; // For generating Interview-Ids if needed

// Define interfaces for expected API request bodies and responses (optional but recommended for type safety)
// /diagnosis
interface DiagnosisRequestBody {
    sex: 'male' | 'female';
    age: { value: number; unit?: string }; // unit defaults to 'year'
    evidence: Array<{ id: string; choice_id: 'present' | 'absent' | 'unknown'; source?: string }>;
    extras?: { [key: string]: any }; // For options like enable_explanations
}

///diagnosis response
interface DiagnosisResponse {
    question: any; //idk what to put here
    conditions: Array<{ id: string; name: string; common_name: string; probability: number }>;
    should_stop: boolean;
    has_emergency_evidence?: boolean;
}

// /search response
interface SearchResponseItem {
    id: string;
    label: string;
}

// /explain request body
interface ExplainRequestBody {
    sex: 'male' | 'female';
    age: { value: number; unit?: string };
    evidence: Array<{ id: string; choice_id: 'present' | 'absent' | 'unknown'; source?: string }>;
    target: string; // The condition ID to explain
}

///explain response
interface ExplainResponse {
    supporting_evidence: Array<any>; // Define more strictly based on API doc
    conflicting_evidence: Array<any>; // Define more strictly based on API doc
}

class InfermedicaService {
    private apiClient: AxiosInstance;

    constructor() {
        if (!config.infermedica.appId || !config.infermedica.appKey) {
            throw new Error('Infermedica API credentials (App-Id, App-Key) are missing in configuration.');
        }

        this.apiClient = axios.create({
            baseURL: config.infermedica.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'App-Id': config.infermedica.appId,
                'App-Key': config.infermedica.appKey,
                // interview id needs to be generated everytime we send a new request
            },
            timeout: 15000,
        });

        // https://medium.com/@jscodelover/understanding-request-and-response-interceptors-in-javascript-e2fe20dbabbf
        this.apiClient.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                console.error(`Infermedica API Error: ${error.message}`);
                if (error.response) {
                    console.error(`Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error setting up request:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // 
    /**
     * Calls the /search endpoint
     * phrase
     * age
     * sex
     * interviewId
     * returns a list of search results
     */
    async searchSymptoms(phrase: string, age: number, sex: 'male' | 'female', interviewId: string): Promise<SearchResponseItem[]> {
        try {
            const response = await this.apiClient.get<SearchResponseItem[]>('/search', {
                params: {
                    phrase,
                    age: { value: age }, //age.value – the patient's age, which should be a positive integer between 0 and 130.
                    sex,
                },
                headers: {
                    'Interview-Id': interviewId,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to call /search for phrase "${phrase}"`, error);
            throw error;
        }
    }

    /**
     * /diagnosis endpoint
     * request - The sex, age, and evidence.
     * interviewId
     * returns a diagnosis response
     */
    async getDiagnosis(requestBody: DiagnosisRequestBody, interviewId: string): Promise<DiagnosisResponse> {
         // error checking
         if (typeof requestBody.age !== 'object' || requestBody.age === null) {
            throw new Error('Age must be provided as an object { value: number }');
        }
        requestBody.age.unit = requestBody.age.unit || 'year'; // ran into an error here, where I didnt give a year and it freaked out so here we go

        try {
            const response = await this.apiClient.post<DiagnosisResponse>('/diagnosis', requestBody, {
                headers: {
                    'Interview-Id': interviewId,
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to call /diagnosis for interview ${interviewId}`, error);
            throw error;
        }
    }

    /**
     * /explain endpoint
     * request - sex, age, evidence, and condition ID
     * interviewId
     * returns an explanation response or null if restricted
     */
    async getExplanation(requestBody: ExplainRequestBody, interviewId: string): Promise<ExplainResponse | null> {
        if (typeof requestBody.age !== 'object' || requestBody.age === null) {
           throw new Error('Age must be provided as an object { value: number }');
       }
       requestBody.age.unit = requestBody.age.unit || 'year';

        try {
            const response = await this.apiClient.post<ExplainResponse>('/explain', requestBody, {
                headers: {
                    'Interview-Id': interviewId,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // explain is a 'premium' endpoint, so it might be restricted after a certain amount of calls, need to check if that is the case
                if (error.response.status === 403 || error.response.status === 402) {
                    console.warn(`/explain endpoint access restricted for interview ${interviewId}. Check API plan.`);
                    return null; 
                }
            }
            console.error(`Failed to call /explain for interview ${interviewId}, target ${requestBody.target}`, error);
            throw error; 
        }
    }
}

export const infermedicaService = new InfermedicaService();
