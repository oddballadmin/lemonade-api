import express from 'express';
import cors from 'cors';
import protect from '../middleware/authenticate.js';
import { limitRate } from '../middleware/rate-limiter.js';
import { registerUser, loginUser, getProfile, getUser } from '../controllers/authController.js';
const authRouter = express.Router();

// Middleware to allow cross-origin requests(CORS)
authRouter.use(cors({
    origin: process.env.VITE_NODE_ENV == "development" ? "http://localhost:5173" : process.env.VITE_CLIENT_BASE_URL,
    credentials: true,

    // Secure in production

}));

// API - Routes
if (process.env.VITE_NODE_ENV === 'production') {
    authRouter.post('/register', limitRate, registerUser);
    authRouter.post('/login', limitRate, loginUser);
    authRouter.get('/profile', limitRate, protect, getProfile);
    authRouter.get('/user', limitRate, protect, getUser);
} else {
    authRouter.post('/api/register', registerUser);
    authRouter.post('/api/login', loginUser);
    authRouter.get('/api/profile', protect, getProfile);
    authRouter.get('/api/user', protect, getUser);
}

export default authRouter;