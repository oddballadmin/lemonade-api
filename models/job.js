// job.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    descriptionImages: [{
        type: String
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Completed'],
        default: 'Open'
    },
    applicants: [{
        type: Schema.Types.ObjectId,
        ref: 'Applicant' // Reference the Applicant model
    }],
    acceptedApplicant: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dateCompleted: {
        type: Date
    },
    payment: {
        type: Number,
        required: true
    }
});

const JobModel = mongoose.model('Job', jobSchema);

export default JobModel;
