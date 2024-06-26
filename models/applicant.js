// applicant.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const applicantSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job', // Reference the Job model
        required: true
    },


    dateApplied: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },

});

const Applicant = mongoose.model('Applicant', applicantSchema);

export default Applicant;
