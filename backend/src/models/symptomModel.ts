// Symptom model interface
export interface Symptom {
  id?: number; // Database ID (auto-generated)
  infermedica_id: string; // Infermedica symptom ID (e.g., "s_21")
  name: string; // Infermedica symptom name
  severity: 'mild' | 'moderate' | 'severe';
  duration?: string;
}

// Methods for symptoms operations
import { Pool } from 'pg';

/**
 * Insert a symptom into the database
 * Since we don't have a description column in the symptoms table,
 * we'll store the Infermedica ID as part of the name with a special prefix
 */
export async function saveSymptom(
  pool: Pool,
  symptom: Symptom
): Promise<number> {
  // Format name to include Infermedica ID
  const nameWithId = `${symptom.name} [${symptom.infermedica_id}]`;
  
  // Check if symptom with this Infermedica ID already exists by looking for the ID in the name
  const existingResult = await pool.query(
    `SELECT id FROM symptoms WHERE name LIKE $1`,
    [`%[${symptom.infermedica_id}]%`]
  );

  if (existingResult.rows.length > 0) {
    // Update existing symptom
    await pool.query(
      `UPDATE symptoms 
       SET name = $2, severity = $3, duration = $4
       WHERE id = $1`,
      [
        existingResult.rows[0].id,
        nameWithId,
        symptom.severity,
        symptom.duration || null
      ]
    );
    return existingResult.rows[0].id;
  } else {
    // Insert new symptom
    const result = await pool.query(
      `INSERT INTO symptoms (name, severity, duration) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      [
        nameWithId,  // Store name with embedded Infermedica ID
        symptom.severity,
        symptom.duration || null
      ]
    );
    
    return result.rows[0].id;
  }
}

/**
 * Link a symptom to a patient
 */
export async function linkSymptomToPatient(
  pool: Pool,
  patientId: number,
  symptomId: number
): Promise<void> {
  await pool.query(
    `INSERT INTO patient_symptoms (patient_id, symptom_id) 
     VALUES ($1, $2) 
     ON CONFLICT DO NOTHING`,
    [patientId, symptomId]
  );
}

/**
 * Get all symptoms for a patient
 */
export async function getPatientSymptoms(
  pool: Pool,
  patientId: number
): Promise<Symptom[]> {
  const result = await pool.query(
    `SELECT s.* 
     FROM symptoms s
     JOIN patient_symptoms ps ON s.id = ps.symptom_id
     WHERE ps.patient_id = $1`,
    [patientId]
  );
  
  return result.rows;
}
