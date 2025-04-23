import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
// import { findUserById } from '../models/userModel'; 

// include user property
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
        role: 'Nurse' | 'Doctor';
    };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    // check for token in header 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // verify
            const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

            // const user = await findUserById(decoded.userId);
            // if (!user) {
            //     return res.status(401).json({ message: 'Not authorized, user not found' });
            // }
            // req.user = { userId: user.id, email: user.email, role: user.role }; 


            // match payload to login
            if (decoded && typeof decoded === 'object' && 'userId' in decoded && 'email' in decoded && 'role' in decoded) {
                req.user = { 
                    userId: decoded.userId, 
                    email: decoded.email,
                    role: decoded.role
                };
                console.log(`Auth middleware: User ${req.user.email} authorized.`);
                next(); // go to route handler
            } else {
                throw new Error('Invalid token payload');
            }

        } catch (error) {
            console.error('Token verification failed:', error);
            if (error instanceof jwt.TokenExpiredError) {
                 return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                 return res.status(401).json({ message: 'Not authorized, invalid token' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // default case
    if (!token) {
        console.warn('Auth middleware: No token found in request.');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// restrict access based on role
export const restrictTo = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
        }
        next();
    };
};
