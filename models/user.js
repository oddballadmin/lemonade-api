import mongoose from "mongoose";
import applicantSchema from "./applicant.js";
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
        required: true,
    },
    zipcode: {
        type: String,
        required: true,
    },
    birthdate: {
        type: Date,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    jobsCreated: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }],
    jobsApplied: [{
        type: Schema.Types.ObjectId,
        ref: 'Applicant' // Reference the Applicant model
    }],
    jobsCompleted: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }],
    jobsAccepted: [{
        type: Schema.Types.ObjectId,
        ref: 'Job'
    }],
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
