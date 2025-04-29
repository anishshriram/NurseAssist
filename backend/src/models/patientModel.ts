// Patient model interface
export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  medical_history?: string;
  nurse_id: number;
  doctor_id?: number;
  created_at?: Date;
}

// Methods for patient operations
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
