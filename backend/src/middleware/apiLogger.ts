import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { createApiLog } from '../models/apiLogModel';

/**
 * Middleware to log API requests and responses for diagnosis endpoints
 * @param pool The database connection pool
 * @returns Middleware function
 */
export const apiLogger = (pool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Get request data to log
    const requestData = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      timestamp: new Date().toISOString()
    };
    
    // Define a function to log the request and response
    const logApiCall = async (diagnosisId: number | null, responseBody: any) => {
      try {
        // Convert request and response to strings for storage
        const requestStr = JSON.stringify(requestData);
        const responseStr = JSON.stringify(responseBody);
        
        // Log to the database
        await createApiLog(
          pool,
          diagnosisId, 
          requestStr, 
          responseStr
        );
        
        console.log(`API Log created for ${req.method} ${req.originalUrl}`);
      } catch (error) {
        console.error('Error creating API log:', error);
      }
    };
    
    // Override the response send method to capture the response data
    res.send = function (body: any): Response {
      // Extract diagnosis_id from response if available
      let diagnosisId = null;
      
      try {
        // If body is a string that looks like JSON, parse it
        if (typeof body === 'string' && body.startsWith('{') && body.endsWith('}')) {
          const parsedBody = JSON.parse(body);
          diagnosisId = parsedBody.diagnosis_id || parsedBody.id || null;
        } 
        // If body is already an object
        else if (typeof body === 'object' && body !== null) {
          diagnosisId = body.diagnosis_id || body.id || null;
        }
        
        // Log API call with diagnosis ID if this is a diagnosis-related endpoint
        if (req.originalUrl.includes('/diagnosis') || 
            req.originalUrl.includes('/diagnoses') ||
            req.originalUrl.includes('/symptoms') ||
            req.originalUrl.includes('/patients')) {
          logApiCall(diagnosisId, typeof body === 'string' ? JSON.parse(body) : body);
        }
      } catch (error) {
        console.error('Error processing API log:', error);
      }
      
      // Call the original method
      return originalSend.call(this, body);
    };
    
    // Override the response json method to capture the response data
    res.json = function (body: any): Response {
      // Extract diagnosis_id from response if available
      let diagnosisId = null;
      
      try {
        if (body && typeof body === 'object') {
          diagnosisId = body.diagnosis_id || body.id || null;
        }
        
        // Log API call with diagnosis ID if this is a diagnosis-related endpoint
        if (req.originalUrl.includes('/diagnosis') || 
            req.originalUrl.includes('/diagnoses') ||
            req.originalUrl.includes('/symptoms') ||
            req.originalUrl.includes('/patients')) {
          logApiCall(diagnosisId, body);
        }
      } catch (error) {
        console.error('Error processing API log:', error);
      }
      
      // Call the original method
      return originalJson.call(this, body);
    };
    
    next();
  };
};
