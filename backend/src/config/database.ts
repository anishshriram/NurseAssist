import { Pool } from 'pg';

// Create a pool for PostgreSQL database connections
const pool = new Pool({
  connectionString: process.env.DB_URI,
});

// Log when connection is established
pool.on('connect', () => {
  console.log(`Database connection pool created for ${process.env.DB_URI}`);
});

// Log errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Export the pool for use in other modules
export { pool };
