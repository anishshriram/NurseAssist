import dotenv from 'dotenv';
import path from 'path';

// dotenv stuffs
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    jwtSecret: process.env.JWT_SECRET || 'default_secret_key_change_me', 
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD, 
        name: process.env.DB_NAME || 'nurse_assist_dev',
    },
    infermedica: {
        appId: process.env.INFERMEDICA_APP_ID, 
        appKey: process.env.INFERMEDICA_APP_KEY, 
        baseUrl: 'https://api.infermedica.com/v3' 
    },

};

// error checking
if (!config.db.password) {
    console.error("FATAL ERROR: DB_PASSWORD environment variable is not set.");
    process.exit(1);
}
if (!config.infermedica.appId || !config.infermedica.appKey) {
    console.error("FATAL ERROR: INFERMEDICA_APP_ID or INFERMEDICA_APP_KEY environment variable is not set.");
    process.exit(1);
}
if (config.jwtSecret === 'default_secret_key_change_me') {
    console.warn("Warning: JWT_SECRET is using the default value. Set a strong secret in your .env file for production.");
}

export default config;
