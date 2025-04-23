import { query } from '../utils/db'; 
import bcrypt from 'bcrypt';
import { z } from 'zod';

// validating user data 
export const UserSchema = z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'), 
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['Nurse', 'Doctor'], {
        errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_type && issue.received === 'undefined') {
                return { message: 'Role is required' };
            }
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
                return { message: "Role must be 'Nurse' or 'Doctor'" };
            }
            return { message: ctx.defaultError };
        }
    }),
});

export type UserInput = z.infer<typeof UserSchema>;

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'Nurse' | 'Doctor';
    createdAt: Date;
}

const SALT_ROUNDS = 10;

export const createUser = async (userData: UserInput): Promise<User> => {
    const validatedData = UserSchema.parse(userData);

    const { name, email, password, role } = validatedData;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
        INSERT INTO nurses_doctors (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at AS "createdAt";
    `;

    try {
        const result = await query(sql, [name, email, passwordHash, role]);
        if (result.rows.length === 0) {
            throw new Error('User creation failed, no data returned.');
        }
        return result.rows[0] as User;
    } catch (error: any) {
        if (error.code === '23505' && error.constraint === 'nurses_doctors_email_key') {
            throw new Error('Email address is already registered.');
        }
        console.error('Error creating user in database:', error);
        throw new Error('Failed to create user due to a database error.');
    }
};

/**
 * Finds a user by their email address.
 */
export const findUserByEmail = async (email: string): Promise<(User & { passwordHash: string }) | null> => {
    const sql = `
        SELECT id, name, email, password_hash AS "passwordHash", role, created_at AS "createdAt"
        FROM nurses_doctors
        WHERE email = $1;
    `;
    try {
        const result = await query(sql, [email]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as (User & { passwordHash: string });
    } catch (error) {
        console.error(`Error finding user by email ${email}:`, error);
        throw new Error('Failed to retrieve user due to a database error.');
    }
};
