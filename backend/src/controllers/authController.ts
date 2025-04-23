import { Request, Response, NextFunction } from 'express';
import { createUser, UserSchema } from '../models/userModel';
import { z } from 'zod';

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

// still need to make this, only doing register for now
export const login = async (req: Request, res: Response, next: NextFunction) => {
    // login - find user, compare password, generate JWT
    res.status(501).json({ message: 'Login not implemented yet' });
};
