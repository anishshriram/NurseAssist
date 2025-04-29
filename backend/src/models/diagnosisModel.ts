// Diagnosis model interface
export interface Diagnosis {
  id?: number;
  patient_id: number;
  condition_id: string; // Infermedica condition ID (e.g., "c_87")
  condition_name: string; // Condition name from Infermedica
  critical_flag: boolean;
  confidence_score: number;
  doctor_confirmation: boolean;
  diagnosis_date?: Date;
  nurse_id: number; // To track which nurse made the diagnosis
  nurse_name?: string; // For display to doctors
}

// Methods for diagnosis operations
import { Pool } from 'pg';
import { Symptom } from './symptomModel';

/**
 * Save a diagnosis with associated symptoms
 */
export async function saveDiagnosis(
  pool: Pool, 
  diagnosis: Diagnosis, 
  symptoms: Symptom[]
): Promise<number> {
  // Start a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Insert the condition if it doesn't exist
    // Store the external Infermedica ID in the description field, as our DB uses auto-incrementing IDs
    const conditionResult = await client.query(
      `INSERT INTO conditions (name, description) 
       VALUES ($1, $2) 
       ON CONFLICT (name) DO UPDATE SET description = $2
       RETURNING id`,
      [diagnosis.condition_name, `Infermedica ID: ${diagnosis.condition_id}`]
    );
    
    const condition_id = conditionResult.rows[0].id;
    
    // 2. Insert the diagnosis
    const diagnosisResult = await client.query(
      `INSERT INTO diagnoses 
       (patient_id, condition_id, critical_flag, confidence_score, doctor_confirmation) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
      [
        diagnosis.patient_id, 
        condition_id,
        diagnosis.critical_flag || false, 
        diagnosis.confidence_score, 
        false // doctor_confirmation starts as false
      ]
    );
    
    const diagnosis_id = diagnosisResult.rows[0].id;
    
    // 3. Insert symptoms
    for (const symptom of symptoms) {
      // Format name to include Infermedica ID
      const nameWithId = `${symptom.name} [${symptom.infermedica_id}]`;
      
      // Check if symptom with this Infermedica ID already exists by looking for the ID in the name
      const existingSymptomResult = await client.query(
        `SELECT id FROM symptoms WHERE name LIKE $1`,
        [`%[${symptom.infermedica_id}]%`]
      );

      let symptom_id;
      
      if (existingSymptomResult.rows.length > 0) {
        // Update existing symptom
        await client.query(
          `UPDATE symptoms 
           SET name = $2, severity = $3, duration = $4
           WHERE id = $1`,
          [
            existingSymptomResult.rows[0].id,
            nameWithId,
            symptom.severity || 'moderate',
            symptom.duration || null
          ]
        );
        symptom_id = existingSymptomResult.rows[0].id;
      } else {
        // Insert new symptom
        const symptomResult = await client.query(
          `INSERT INTO symptoms (name, severity, duration) 
           VALUES ($1, $2, $3) 
           RETURNING id`,
          [
            nameWithId,  // Store name with embedded Infermedica ID
            symptom.severity || 'moderate',
            symptom.duration || null
          ]
        );
        symptom_id = symptomResult.rows[0].id;
      }
      
      // Link symptom to patient
      await client.query(
        `INSERT INTO patient_symptoms (patient_id, symptom_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [diagnosis.patient_id, symptom_id]
      );
      
      // Link symptom to diagnosis
      await client.query(
        `INSERT INTO diagnosis_symptoms (diagnosis_id, symptom_id) 
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [diagnosis_id, symptom_id]
      );
    }
    
    await client.query('COMMIT');
    return diagnosis_id;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all diagnoses for a specific patient
 */
export async function getDiagnosesByPatientId(
  pool: Pool, 
  patientId: number
): Promise<any[]> {
  const result = await pool.query(
    `SELECT d.*, c.name as condition_name, nd.name as nurse_name
     FROM diagnoses d
     JOIN conditions c ON d.condition_id = c.id
     JOIN patients p ON d.patient_id = p.id
     JOIN nurses_doctors nd ON p.nurse_id = nd.id
     WHERE d.patient_id = $1
     ORDER BY d.diagnosis_date DESC, d.confidence_score DESC`,
    [patientId]
  );
  
  return result.rows;
}

/**
 * Get all diagnoses for patients assigned to a doctor
 */
export async function getDiagnosesForDoctor(
  pool: Pool, 
  doctorId: number
): Promise<any[]> {
  const result = await pool.query(
    `SELECT 
      d.id, d.patient_id, d.confidence_score, d.critical_flag, 
      d.doctor_confirmation, d.diagnosis_date,
      p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
      c.name as condition_name,
      nd.name as nurse_name
     FROM diagnoses d
     JOIN conditions c ON d.condition_id = c.id
     JOIN patients p ON d.patient_id = p.id
     JOIN nurses_doctors nd ON p.nurse_id = nd.id
     WHERE p.doctor_id = $1
     ORDER BY d.diagnosis_date DESC, d.confidence_score DESC`,
    [doctorId]
  );
  
  return result.rows;
}

/**
 * Confirm or reject a diagnosis (doctor function)
 */
export async function confirmDiagnosis(
  pool: Pool, 
  diagnosisId: number, 
  confirmed: boolean
): Promise<boolean> {
  const result = await pool.query(
    `UPDATE diagnoses
     SET doctor_confirmation = $1
     WHERE id = $2
     RETURNING id`,
    [confirmed, diagnosisId]
  );
  
  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Get symptoms associated with a diagnosis
 */
export async function getDiagnosisSymptoms(
  pool: Pool, 
  diagnosisId: number
): Promise<Symptom[]> {
  const result = await pool.query(
    `SELECT s.* 
     FROM symptoms s
     JOIN diagnosis_symptoms ds ON s.id = ds.symptom_id
     WHERE ds.diagnosis_id = $1`,
    [diagnosisId]
  );
  
  return result.rows;
}
