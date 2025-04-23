import app from './app';
import config from './config';

const PORT = config.port;

const startServer = async () => {
    try {
        // await connectDB();
        // console.log('Database connected successfully.');

        const server = app.listen(PORT, () => {
            console.log(`Server running in ${config.env} mode on port ${PORT}`);
            console.log(`API health check available at http://localhost:${PORT}/health`);
        });

        // Graceful shutdown? (I saw this online, not sure if needed)
        const shutdown = (signal: string) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT')); //catch signals (I am on linux so sigint)

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
