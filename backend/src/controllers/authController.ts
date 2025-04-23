import { Request, Response, NextFunction } from 'express';
import { createUser, UserSchema, findUserByEmail } from '../models/userModel';
import { z } from 'zod';
import bcrypt from 'bcrypt'; // Import bcrypt for password comparison
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for JWT generation
import config from '../config'; // Import config for JWT secret

/**
 * Handles user registration requests.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate request body using the schema from the model
        const userData = UserSchema.parse(req.body);

        // create the user
        console.log(`Attempting to register user: ${userData.email}`);
        const newUser = await createUser(userData);

        // respond with the created user data
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            console.warn(`Registration validation failed for ${req.body?.email}:`, error.errors);
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        if (error.message === 'Email address is already registered.') {
            console.warn(`Registration failed for ${req.body?.email}: Email already exists.`);
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        console.error(`Error during registration for ${req.body?.email}:`, error);
        next(error); 
    }
};

//Zod schema for validation
const LoginSchema = z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'), // Keep min(1) for empty string check if needed
});

// controller functions 
// login - find user, compare password, generate JWT
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // validate request
        const loginData = LoginSchema.parse(req.body);
        const { email, password } = loginData;

        // find user by email
        console.log(`Login attempt for user: ${email}`);
        const user = await findUserByEmail(email);

        // check if user exists and password is correct
        if (!user) {
            console.warn(`Login failed for ${email}: User not found.`);
            return res.status(401).json({ message: 'Invalid email or password' }); // Generic message for security
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            console.warn(`Login failed for ${email}: Invalid password.`);
            return res.status(401).json({ message: 'Invalid email or password' }); // Generic message
        }

        // JWT
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const token = jwt.sign(
            payload,
            config.jwtSecret, 
            { expiresIn: '1h' } // token expires?
        );

        console.log(`Login successful for user: ${email}`);
        // send JWT to client
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn(`Login validation failed for ${req.body?.email}:`, error.errors);
            return res.status(400).json({ message: 'Validation failed', errors: error.errors });
        }
        console.error(`Error during login for ${req.body?.email}:`, error);
        next(error); 
    }
};
