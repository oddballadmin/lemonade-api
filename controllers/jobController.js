import Job from '../models/job.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Applicant from '../models/applicant.js';
import 'dotenv/config';
import { validationResult } from 'express-validator';



export const createJob = async (req, res) => {
    try {
        const { title, description, descriptionImages, payment, zipcode, creator } = req.body;
        const token = req.cookies.token;

        if (!token) return res.status(401).json({ error: 'Unauthorized, token not found' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

        if (!title || !description || !payment || !zipcode || zipcode.length < 5 || payment < 0) {
            return res.status(400).json({ error: 'Please fill all fields correctly' });
        }

        const job = new Job({
            title,
            description,
            descriptionImages,
            createdBy: decoded._id,
            dateCreated: Date.now(),
            location: zipcode,
            payment,
            creator: creator
        });

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.jobsCreated.push(job._id);

        await Promise.all([user.save(), job.save()]);

        return res.json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getJobsByZipcode = async (req, res) => {
    try {
        const { zipcode } = req.params;
        if (!zipcode) {
            return res.status(400).json({ error: 'Please provide a zipcode' });
        }
        if (zipcode.length < 5) {
            return res.status(400).json({ error: 'Invalid zipcode' });
        }

        const jobs = await Job.find({ location: zipcode });
        return res.json(jobs);

    }
    catch (error) {
        console.error('Error getting jobs by zipcode:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: 'Please provide a job ID' });
        }

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        return res.json(job);


    }
    catch (error) {
        console.error('Error getting job by ID:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const filterJobs = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { zipcode, status } = req.query;
    let filter = {};

    try {
        if (zipcode) {
            if (!/^\d{5}$/.test(zipcode)) {
                return res.status(400).json({ error: 'Invalid zipcode format' });
            }
            filter.location = zipcode;
        }
        if (status) {
            if (!['Open', 'In Progress', 'Completed'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }
            filter.status = status;

        }

        const jobs = await Job.find(filter);
        return res.json(jobs);

    }
    catch (error) {
        console.error('Error filtering jobs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ error: 'Please provide a job ID and status' });
        }

        if (!['Open', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        job.status = status;

        await job.save();
        return res.json(job);

    }
    catch (error) {
        console.error('Error updating job status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

}
export const editJobListing = async (req, res) => {
    try {
        const { title, description, descriptionImages, payment, zipcode } = req.body;
        const { id } = req.params;

        const token = req.cookies.token;


        if (!token) return res.status(401).json({ error: 'Unauthorized, token not found' });

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log the decoded token for debugging

        if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

        // Validate input fields
        if (!title || !description || !payment || !zipcode) {
            return res.status(400).json({ error: 'Please fill all the fields' });
        }
        if (zipcode.length < 5) {
            return res.status(400).json({ error: 'Invalid zipcode' });
        }
        if (payment < 0) {
            return res.status(400).json({ error: 'Payment cannot be negative' });
        }

        // Create a new job
        const job = new Job({
            title,
            description,
            descriptionImages,
            createdBy: decoded._id,
            dateCreated: Date.now(),
            location: zipcode,
            payment,
        });


        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Save the job to the database
        await user.save();
        await job.save();

        // Return the saved job
        return res.json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}
export const jobApply = async (req, res) => {
    try {
        const token = req.cookies.token;
        const { message } = req.body;
        const { id } = req.params;

        if (!token) return res.status(401).json({ error: 'Unauthorized, token not found' });

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const job = await Job.findById(id);
        const user = await User.findById(decoded._id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hasApplied = await Applicant.findOne({ userId: decoded._id, jobId: id });
        if (hasApplied) {
            return res.status(400).json({ error: 'User has already applied to this job' });
        }

        const newApplicant = new Applicant({
            userId: decoded._id,
            jobId: id,
            dateApplied: Date.now(),
            message: message,

        });

        await newApplicant.save();

        job.applicants.push(newApplicant._id);
        user.jobsApplied.push(newApplicant._id);

        await Promise.all([job.save(), user.save()]);

        const populatedApplicant = await Applicant.findById(newApplicant._id).populate('userId').populate('jobId');

        return res.json(newApplicant);
    }
    catch (error) {
        console.error('Error Applying to job:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized, invalid token' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }

}
export const getAllJobs = async (req, res) => {
    const jobs = await Job.find();
    if (!jobs) {
        return res.status(404).json({ error: 'No jobs found' });
    }
    return res.json(jobs);
};

export const getApplicationData = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized, token not found' });
    const { id } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

    const job = await Job.findById(id);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const jobApplications = await Applicant.find({ jobId: id });
    if (!jobApplications || jobApplications.length === 0) {
        return res.status(404).json({ error: 'No applications found' });
    }
    const appDataPromises = jobApplications.map(async (applicant) => {
        const user = await User.findById(applicant.userId);
        if (user) {
            return {
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                phone: user.phone,
                dateApplied: applicant.dateApplied,
                message: applicant.message,
            };
        }
        return null; // In case user is not found
    });
    return res.json(await Promise.all(appDataPromises));


};
