import express from 'express';
import cors from 'cors';
import protect from '../middleware/authenticate.js';
import { limitRate } from '../middleware/rate-limiter.js';
import { getAppData, getUserCreatedJobsData } from '../controllers/profileController.js';
const profileRouter = express.Router();

// Middleware to allow cross-origin requests(CORS)
profileRouter.use(cors({
    origin: process.env.VITE_NODE_ENV == "development" ? "http://localhost:5173" : process.env.VITE_CLIENT_BASE_URL,
    credentials: true,
    // Secure in production
}));

// API - Routes
profileRouter.get('/api/profile/appdata', limitRate, protect, getAppData);
profileRouter.get('/api/profile/jobsdata', limitRate, protect, getUserCreatedJobsData);

export default profileRouter;