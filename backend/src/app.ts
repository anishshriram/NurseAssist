import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config'; 

// routing packages
import authRoutes from './routes/authRoutes';
import symptomRoutes from './routes/symptomRoutes';
import diagnosisRoutes from './routes/diagnosisRoutes';
// import patientRoutes from './routes/patientRoutes';
// import sessionRoutes from './routes/sessionRoutes';

const app: Express = express();

// CORS
app.use(cors());

// JSON
app.use(express.json());

// URL encoded
app.use(express.urlencoded({ extended: true }));

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
// app.use('/api/patients', patientRoutes);


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
