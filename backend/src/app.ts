import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import helmet from 'helmet';
import config from './config'; 
import { apiLogger } from './middleware/apiLogger';

// routing packages
import authRoutes from './routes/authRoutes';
import symptomRoutes from './routes/symptomRoutes';
import diagnosisRoutes from './routes/diagnosisRoutes';
import patientRoutes from './routes/patientRoutes';
import userRoutes from './routes/userRoutes';
import conditionRoutes from './routes/conditionRoutes';
import apiLogRoutes from './routes/apiLogRoutes';
// import sessionRoutes from './routes/sessionRoutes';

const app: Express = express();

// CORS
app.use(cors());

// JSON
app.use(express.json());

// URL encoded
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

// Create database pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432')
});

// Add API logging middleware
app.use(apiLogger(pool));

// logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


// health checking
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// routing
app.use('/api/symptoms', symptomRoutes);
app.use('/api/diagnosis', diagnosisRoutes); // Mount diagnosis routes
app.use('/api/auth', authRoutes);
// app.use('/api/sessions', sessionRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conditions', conditionRoutes);
app.use('/api/logs', apiLogRoutes); // Mount API log routes


// error handling
// 404 
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Not Found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler Caught:", err);
    res.status(500).json({
         message: 'Internal Server Error',
         error: config.env === 'development' ? err.message : undefined,
    });
});


export default app;
