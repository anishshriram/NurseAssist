// /home/adilh/classes/NurseAssist/backend/tests/auth.test.ts
import request from 'supertest';
import app from '../src/app'; // Import your Express app instance
import pool from '../src/utils/db'; // Import the database pool

// Hold the server instance if needed for specific teardown
// let server: any;

// Before all tests, ensure the database pool is available
beforeAll(async () => {
    // Optional: You could start the server here if it's not running
    // server = app.listen(config.port); 
    // Ensure the pool is ready (it should be initialized when imported)
    try {
        const client = await pool.connect();
        console.log('Test DB connection pool is active.');
        client.release();
    } catch (err) {
        console.error('Failed to connect to test DB pool:', err);
        // Optionally throw the error to stop tests if DB is essential
        // throw err;
    }
});

// After all tests, close the database pool gracefully
afterAll(async () => {
    await pool.end();
    console.log('Test DB connection pool closed.');
    // Optional: Close server if started in beforeAll
    // if (server) server.close(); 
});

// Before each test, clean the relevant tables to ensure isolation
beforeEach(async () => {
    try {
        // Delete all users before each test run
        await pool.query('DELETE FROM nurses_doctors');
        // You might need to reset sequences if using SERIAL PKs and exact IDs matter
        // await pool.query('ALTER SEQUENCE nurses_doctors_id_seq RESTART WITH 1');
        console.log('nurses_doctors table cleaned.');
    } catch (err) {
        console.error('Failed to clean nurses_doctors table:', err);
    }
});

describe('Authentication API (/api/auth)', () => {

    // --- Registration Tests --- 
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                name: 'Test Nurse',
                email: 'test.nurse@example.com',
                password: 'password123',
                role: 'Nurse' as 'Nurse' | 'Doctor', // Type assertion needed
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id'); // Check if ID is returned
            expect(response.body.user.email).toBe(newUser.email);
            expect(response.body.user.name).toBe(newUser.name);
            expect(response.body.user.role).toBe(newUser.role);
            expect(response.body.user).not.toHaveProperty('password'); // Ensure password isn't returned
            expect(response.body.user).not.toHaveProperty('passwordHash'); // Ensure hash isn't returned
        });

        it('should return 409 Conflict when registering with a duplicate email', async () => {
            const userData = {
                name: 'Test User 1',
                email: 'duplicate@example.com',
                password: 'password123',
                role: 'Nurse' as 'Nurse' | 'Doctor',
            };
            // First registration (should succeed)
            await request(app).post('/api/auth/register').send(userData);

            // Second registration attempt with the same email
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...userData, name: 'Test User 2', password: 'anotherpassword' }); // Different name/pw, same email

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('message', 'Email address is already registered.');
        });

        it('should return 400 Bad Request for missing required fields (e.g., name)', async () => {
            const incompleteUser = {
                // name: 'Missing Name',
                email: 'incomplete@example.com',
                password: 'password123',
                role: 'Doctor' as 'Nurse' | 'Doctor',
            };
            const response = await request(app)
                .post('/api/auth/register')
                .send(incompleteUser);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors).toBeInstanceOf(Array);
            // Check specifically for the error related to the 'name' field
            const nameError = response.body.errors.find((err: any) => err.path.includes('name'));
            expect(nameError).toBeDefined();
            expect(nameError.message).toBe('Name is required'); 
        });

        it('should return 400 Bad Request for invalid email format', async () => {
            const invalidEmailUser = {
                name: 'Invalid Email Test',
                email: 'not-an-email',
                password: 'password123',
                role: 'Nurse' as 'Nurse' | 'Doctor',
            };
            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidEmailUser);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            const emailError = response.body.errors.find((err: any) => err.path.includes('email'));
            expect(emailError).toBeDefined();
            expect(emailError.message).toBe('Invalid email address');
        });

        it('should return 400 Bad Request for password too short', async () => {
             const shortPasswordUser = {
                name: 'Short PW Test',
                email: 'shortpw@example.com',
                password: '123',
                role: 'Doctor' as 'Nurse' | 'Doctor',
            };
            const response = await request(app)
                .post('/api/auth/register')
                .send(shortPasswordUser);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            const passwordError = response.body.errors.find((err: any) => err.path.includes('password'));
            expect(passwordError).toBeDefined();
            expect(passwordError.message).toBe('Password must be at least 8 characters long');
        });

        it('should return 400 Bad Request for invalid role', async () => {
             const invalidRoleUser = {
                name: 'Invalid Role Test',
                email: 'invalidrole@example.com',
                password: 'password123',
                role: 'Admin', // Not 'Nurse' or 'Doctor'
            };
            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidRoleUser);
            
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            const roleError = response.body.errors.find((err: any) => err.path.includes('role'));
            expect(roleError).toBeDefined();
            expect(roleError.message).toBe('Role must be \'Nurse\' or \'Doctor\''); // Check Zod error message
        });

    });

    // --- Login Tests --- 
    describe('POST /api/auth/login', () => {
        const testUser = {
            name: 'Login Test User',
            email: 'login.test@example.com',
            password: 'password123',
            role: 'Doctor' as 'Nurse' | 'Doctor',
        };

        // Register the user needed for login tests before running login tests
        beforeEach(async () => {
             await request(app).post('/api/auth/register').send(testUser);
        });

        it('should log in an existing user successfully and return a JWT token', async () => {
            const loginCredentials = {
                email: testUser.email,
                password: testUser.password,
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful');
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');
            expect(response.body.token.split('.').length).toBe(3); // Basic JWT structure check
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
        });

        it('should return 401 Unauthorized for incorrect password', async () => {
            const loginCredentials = {
                email: testUser.email,
                password: 'wrongpassword', // Incorrect password
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            expect(response.body).not.toHaveProperty('token');
        });

        it('should return 401 Unauthorized for non-existent email', async () => {
            const loginCredentials = {
                email: 'nonexistent@example.com', // Email not registered
                password: testUser.password,
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
            expect(response.body).not.toHaveProperty('token');
        });

        it('should return 400 Bad Request for missing password', async () => {
            const loginCredentials = {
                email: testUser.email,
                // password: 'missing'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Validation failed');
            const passwordError = response.body.errors.find((err: any) => err.path.includes('password'));
            expect(passwordError).toBeDefined();
            expect(passwordError.message).toBe('Password is required');
        });

         it('should return 400 Bad Request for invalid email format during login', async () => {
            const loginCredentials = {
                email: 'not-an-email',
                password: 'password123',
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginCredentials);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation failed');
            const emailError = response.body.errors.find((err: any) => err.path.includes('email'));
            expect(emailError).toBeDefined();
            expect(emailError.message).toBe('Invalid email address');
        });

    });

    // --- Middleware/Protected Route Tests --- 
    describe('Protected Routes Access', () => {
        let authToken = '';
        const testUserCredentials = {
            name: 'Protected Route User',
            email: 'protected.route@example.com',
            password: 'password123',
            role: 'Nurse' as 'Nurse' | 'Doctor',
        };

        // Register and log in a user before these tests to get a valid token
        beforeAll(async () => {
            // Ensure user exists
            await request(app).post('/api/auth/register').send(testUserCredentials);
            // Log in to get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUserCredentials.email,
                    password: testUserCredentials.password,
                });
            if (loginResponse.body.token) {
                authToken = loginResponse.body.token;
                console.log('Auth token obtained for protected route tests.');
            } else {
                console.error('Failed to get auth token in beforeAll hook for protected route tests.');
                // Throw an error or handle appropriately if token is critical
                throw new Error('Could not obtain auth token for tests.');
            }
        });

        // Clean up the user created specifically for these tests
        // Note: beforeEach in the parent describe block already clears the table
        // but explicitly logging out or deleting the user might be done here if needed.


        // Test symptom search route
        describe('GET /api/symptoms/search', () => {
            it('should return 401 Unauthorized if no token is provided', async () => {
                const response = await request(app).get('/api/symptoms/search?query=test');
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Not authorized, no token');
            });

            it('should return 401 Unauthorized if invalid token is provided', async () => {
                const response = await request(app)
                    .get('/api/symptoms/search?query=test')
                    .set('Authorization', 'Bearer invalidtoken123');
                expect(response.status).toBe(401);
                 // Message could be 'invalid token' or 'token failed' depending on jwt library specifics
                expect(response.body.message).toMatch(/Not authorized, (invalid token|token failed)/);
            });

            it('should allow access with a valid token', async () => {
                const response = await request(app)
                    .get('/api/symptoms/search?query=headache') // Provide a valid query param
                    .set('Authorization', `Bearer ${authToken}`);
                
                // We expect authentication to pass. 
                // The actual status might be 200 OK (if Infermedica works) or 
                // potentially another error if the Infermedica request fails, 
                // but it SHOULD NOT be 401.
                expect(response.status).not.toBe(401); 
                // More specific check (e.g., expect(response.status).toBe(200);) 
                // would depend on mocking or hitting the actual Infermedica API.
            });
        });

        // Test diagnosis route
        describe('POST /api/diagnosis', () => {
             it('should return 401 Unauthorized if no token is provided', async () => {
                const response = await request(app).post('/api/diagnosis').send({});
                expect(response.status).toBe(401);
                expect(response.body.message).toBe('Not authorized, no token');
            });

            it('should return 401 Unauthorized if invalid token is provided', async () => {
                const response = await request(app)
                    .post('/api/diagnosis')
                    .set('Authorization', 'Bearer invalidtoken123')
                    .send({});
                expect(response.status).toBe(401);
                expect(response.body.message).toMatch(/Not authorized, (invalid token|token failed)/);
            });

            it('should allow access with a valid token (but likely fail validation)', async () => {
                 // Minimal valid-ish body structure based on controller/service
                 const diagnosisRequestBody = {
                     sex: 'male',
                     age: { value: 30 },
                     evidence: [{ id: 's_123', choice_id: 'present' }],
                     extras: {} 
                 };

                const response = await request(app)
                    .post('/api/diagnosis')
                    .set('Authorization', `Bearer ${authToken}`)
                    .set('X-Interview-ID', 'test-interview-123') // Add required header
                    .send(diagnosisRequestBody); // Send some data

                // Authentication should pass.
                // We expect a 400 Bad Request because Zod validation in the *controller*
                // might fail if the body isn't perfect, or potentially a 500 if the 
                // Infermedica service call fails, but it SHOULD NOT be 401.
                expect(response.status).not.toBe(401); 
                 // A more precise expectation might be:
                 // expect([200, 400, 503]).toContain(response.status); 
                 // depending on how Infermedica service behaves.
            });
        });
    });

});
