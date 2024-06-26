import Job from '../models/job.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Applicant from '../models/applicant.js';
import 'dotenv/config';
import { validationResult } from 'express-validator';

export const getAppData = async (req, res) => {
    try {

        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Unauthorized, token not found' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        const jobApplications = await Applicant.find({ userId: decoded._id });

        if (!jobApplications || jobApplications.length === 0) {
            return res.status(404).json({ error: 'No applications found' });
        }
        const appDataPromises = user.jobsApplied.map(async (applicantId) => {
            const applicant = await Applicant.findById(applicantId);
            if (applicant) {
                const job = await Job.findById(applicant.jobId);
                if (job) {
                    return {
                        title: job.title,
                        creator: job.creator,
                        dateApplied: applicant.dateApplied,
                        status: job.status,
                        message: applicant.message
                    };
                }
            }
            return null; // In case either applicant or job is not found
        });

        const appData = await Promise.all(appDataPromises);

        // Filter out any null values
        const filteredAppData = appData.filter(data => data !== null);

        return res.json(filteredAppData);

    } catch (error) {
        console.error('Error getting user data:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getUserCreatedJobsData = async (req, res) => {
    try {
        // Extract token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized, token missing' });
        }

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID from decoded token
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve jobs created by the user
        const jobsCreatedByUser = user.jobsCreated;
        if (!jobsCreatedByUser || jobsCreatedByUser.length === 0) {
            return res.status(404).json({ error: 'No jobs found' });
        }

        // Fetch job details
        const jobsDataPromises = jobsCreatedByUser.map(async (jobId) => {
            const job = await Job.findById(jobId);
            if (job) {
                return {
                    title: job.title,
                    description: job.description,
                    status: job.status,
                    dateCreated: job.dateCreated,
                    applicants: job.applicants.length,
                    id: job._id
                };
            }
            return null; // In case job is not found
        });

        // Wait for all job data to be fetched
        const jobsData = await Promise.all(jobsDataPromises);

        // Filter out any null values
        const filteredJobsData = jobsData.filter(data => data !== null);

        // Return the filtered job data
        return res.json(filteredJobsData);

    } catch (error) {
        console.error('Error getting user data:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}
