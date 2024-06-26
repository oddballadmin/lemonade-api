import express from 'express';
import cors from 'cors';
import { createJob, getJobById, filterJobs, updateJobStatus, editJobListing, jobApply, getAllJobs, getApplicationData } from '../controllers/jobController.js';
import protect from '../middleware/authenticate.js';
import { limitRate } from '../middleware/rate-limiter.js';
const jobRouter = express.Router();

// Middleware to allow cross-origin requests(CORS)
jobRouter.use(cors({
    origin: process.env.VITE_NODE_ENV == "development" ? "http://localhost:5173" : process.env.VITE_CLIENT_BASE_URL,
    credentials: true,

    // Secure in production

}));

// API - Routes
jobRouter.post('/api/jobs/create', limitRate, protect, createJob);
jobRouter.get('/api/jobs/all', limitRate, protect, getAllJobs);
jobRouter.get('/api/jobs/filter', limitRate, protect, filterJobs)
jobRouter.get('/api/jobs/:id', limitRate, protect, getJobById);
jobRouter.patch('/api/jobs/update/:id', limitRate, protect, editJobListing);
jobRouter.get('/api/jobs/:id/update/status', limitRate, protect, updateJobStatus);
jobRouter.post('/api/jobs/apply/:id', limitRate, protect, jobApply);
jobRouter.get('/api/jobs/:id/applicants', limitRate, protect, getApplicationData);



export default jobRouter;