import { Pool } from 'pg';
import config from '../config';

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.password,
    port: config.db.port,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// pool.on('error', (err, client) => {
//     console.error('Unexpected error on idle PostgreSQL client', err);
// });

console.log(`Database connection pool created for ${config.db.user}@${config.db.host}:${config.db.port}/${config.db.name}`);

// query function
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), duration, rows: res.rowCount });
        return res;
    } finally {
        client.release();
    }
};

export default pool;
