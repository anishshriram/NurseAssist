import { Pool } from 'pg';

export interface ApiLog {
  id: number;
  diagnosis_id: number | null;
  request_data: string;
  response_data: string;
  timestamp: Date;
}

/**
 * Get all API logs from the database
 * @returns {Promise<ApiLog[]>} The list of API logs
 */
export async function getAllApiLogs(pool: Pool): Promise<ApiLog[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM api_logs ORDER BY timestamp DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching API logs:', error);
    throw new Error('Failed to fetch API logs');
  }
}

/**
 * Get a specific API log by its ID
 * @param {number} id The ID of the API log to retrieve
 * @returns {Promise<ApiLog | null>} The API log or null if not found
 */
export async function getApiLogById(pool: Pool, id: number): Promise<ApiLog | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM api_logs WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching API log with ID ${id}:`, error);
    throw new Error(`Failed to fetch API log with ID ${id}`);
  }
}

/**
 * Get API logs for a specific diagnosis
 * @param {number} diagnosisId The ID of the diagnosis
 * @returns {Promise<ApiLog[]>} The API logs for the diagnosis
 */
export async function getApiLogsByDiagnosisId(pool: Pool, diagnosisId: number): Promise<ApiLog[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM api_logs WHERE diagnosis_id = $1 ORDER BY timestamp DESC',
      [diagnosisId]
    );
    return result.rows;
  } catch (error) {
    console.error(`Error fetching API logs for diagnosis ID ${diagnosisId}:`, error);
    throw new Error(`Failed to fetch API logs for diagnosis ID ${diagnosisId}`);
  }
}

/**
 * Create a new API log
 * @param {number | null} diagnosisId The ID of the diagnosis (can be null)
 * @param {string} requestData The request data as a JSON string
 * @param {string} responseData The response data as a JSON string
 * @returns {Promise<ApiLog>} The created API log
 */
export async function createApiLog(
  pool: Pool,
  diagnosisId: number | null,
  requestData: string,
  responseData: string
): Promise<ApiLog> {
  try {
    const result = await pool.query(
      'INSERT INTO api_logs (diagnosis_id, request_data, response_data) VALUES ($1, $2, $3) RETURNING *',
      [diagnosisId, requestData, responseData]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating API log:', error);
    throw new Error('Failed to create API log');
  }
}
