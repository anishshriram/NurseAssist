import { Pool } from 'pg';

// Global pool reference to be used with dependency injection
let globalPool: Pool;

// Set the global pool - this would typically be called from the app startup
export const setPool = (pool: Pool) => {
  globalPool = pool;
};

/**
 * Interface representing a medical condition
 */
export interface Condition {
  id: number;
  name: string;
  description: string | null;
}

/**
 * Get all medical conditions from the database
 * @returns Promise<Condition[]> Array of all conditions
 */
export const getAllConditions = async (pool: Pool): Promise<Condition[]> => {
  try {
    const query = `
      SELECT id, name, description
      FROM conditions
      ORDER BY name ASC
    `;
    
    const { rows } = await pool.query(query);
    
    console.log(`Retrieved ${rows.length} conditions from database`);
    return rows as Condition[];
  } catch (error) {
    console.error('Error fetching conditions:', error);
    throw new Error('Failed to retrieve conditions');
  }
};

/**
 * Get a single condition by ID
 * @param id Condition ID
 * @returns Promise<Condition | null> The condition or null if not found
 */
export const getConditionById = async (pool: Pool, id: number): Promise<Condition | null> => {
  try {
    const query = `
      SELECT id, name, description
      FROM conditions
      WHERE id = $1
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0] as Condition;
  } catch (error) {
    console.error(`Error fetching condition with ID ${id}:`, error);
    throw new Error('Failed to retrieve condition');
  }
};
