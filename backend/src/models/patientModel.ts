// Patient model interface
export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  medical_history?: string;
  nurse_id: number;
  doctor_id?: number | null;
  created_at?: Date;
}

// Methods for patients
import { Pool } from 'pg';

/**
 * Create a new patient in the database
 */
export async function createPatient(
  pool: Pool,
  patient: Patient
): Promise<number> {
  const result = await pool.query(
    `INSERT INTO patients 
     (name, age, gender, medical_history, nurse_id, doctor_id) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING id`,
    [
      patient.name,
      patient.age,
      patient.gender,
      patient.medical_history || null,
      patient.nurse_id,
      patient.doctor_id || null
    ]
  );
  
  return result.rows[0].id;
}

/**
 * Get all patients for a specific nurse
 */
export async function getPatientsByNurseId(
  pool: Pool,
  nurseId: number
): Promise<Patient[]> {
  const result = await pool.query(
    `SELECT * FROM patients WHERE nurse_id = $1 ORDER BY name`,
    [nurseId]
  );

  return result.rows;
}

/**
 * Update an existing patient in the database
 */
export async function updatePatient(
  pool: Pool,
  patientId: number,
  patientData: Partial<Patient>
): Promise<Patient | null> {
  // Prepare the fields to update and their values
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Only include fields that are provided in the update
  if (patientData.name !== undefined) {
    updateFields.push(`name = $${paramCount++}`);
    values.push(patientData.name);
  }
  
  if (patientData.age !== undefined) {
    updateFields.push(`age = $${paramCount++}`);
    values.push(patientData.age);
  }
  
  if (patientData.gender !== undefined) {
    updateFields.push(`gender = $${paramCount++}`);
    values.push(patientData.gender);
  }
  
  if (patientData.medical_history !== undefined) {
    updateFields.push(`medical_history = $${paramCount++}`);
    values.push(patientData.medical_history || null);
  }
  
  if (patientData.nurse_id !== undefined) {
    updateFields.push(`nurse_id = $${paramCount++}`);
    values.push(patientData.nurse_id);
  }
  
  if (patientData.doctor_id !== undefined) {
    updateFields.push(`doctor_id = $${paramCount++}`);
    values.push(patientData.doctor_id || null);
  }

  // If no fields to update, return null
  if (updateFields.length === 0) {
    return null;
  }

  // Add the patient ID as the last parameter
  values.push(patientId);

  const result = await pool.query(
    `UPDATE patients 
    SET ${updateFields.join(', ')} 
    WHERE id = $${paramCount} 
    RETURNING id, name, age, gender, medical_history, nurse_id, doctor_id, created_at`,
    values
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get all patients for a specific doctor
 */
export async function getPatientsByDoctorId(
  pool: Pool,
  doctorId: number
): Promise<Patient[]> {
  const result = await pool.query(
    `SELECT * FROM patients WHERE doctor_id = $1 ORDER BY name`,
    [doctorId]
  );
  
  return result.rows;
}

/**
 * Get a patient by ID
 */
export async function getPatientById(
  pool: Pool,
  patientId: number
): Promise<Patient | null> {
  const result = await pool.query(
    `SELECT * FROM patients WHERE id = $1`,
    [patientId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Delete a patient from the database
 * @param pool Database connection pool
 * @param patientId ID of the patient to delete
 * @returns Boolean indicating whether the deletion was successful
 */
export async function deletePatient(
  pool: Pool,
  patientId: number
): Promise<boolean> {
  try {
    // Check if patient exists first
    const checkResult = await pool.query(
      `SELECT id FROM patients WHERE id = $1`,
      [patientId]
    );
    
    if (checkResult.rows.length === 0) {
      return false; // Patient not found
    }
    
    // Delete the patient
    const result = await pool.query(
      `DELETE FROM patients WHERE id = $1`,
      [patientId]
    );
    
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error: any) {
    console.error(`Error deleting patient ${patientId}:`, error);
    throw new Error(`Failed to delete patient: ${error.message || 'Unknown error'}`);
  }
}
