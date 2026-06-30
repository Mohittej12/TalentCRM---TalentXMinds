const mongoose = require('mongoose');
const { MockCandidate } = require('./MockStore');

const candidateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a candidate name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please add a candidate email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
            trim: true,
        },
        phone: { type: String, trim: true },
        role: {
            type: String,
            required: [true, 'Please add a target role'],
            trim: true,
        },
        location: { type: String, trim: true },
        skills: { type: [String], default: [] },
        source: {
            type: String,
            enum: ['LinkedIn', 'Naukri', 'Referral', 'Company Website', 'GitHub', 'Internshala', 'Other'],
            default: 'LinkedIn',
        },
        priority: {
            type: String,
            enum: ['Low', 'Normal', 'High', 'Urgent'],
            default: 'Normal',
        },
        notes: { type: String, trim: true },
        resumePath: { type: String },
        resumeOriginalName: { type: String },
        status: {
            type: String,
            enum: {
                values: ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'],
                message: 'Status must be Applied, Screening, Interview, Offered, or Rejected',
            },
            default: 'Applied',
        },
        experience: {
            type: Number,
            required: [true, 'Please add years of experience'],
            min: [0, 'Experience cannot be less than 0'],
        },
    },
    {
        timestamps: true,
    }
);


const CandidateModel = mongoose.model('Candidate', candidateSchema);

const CandidateDelegate = {
    find: (query) => {
        if (global.isMockDB) {
            return MockCandidate.find(query);
        }
        return CandidateModel.find(query);
    },
    create: async (data) => {
        if (global.isMockDB) {
            return await MockCandidate.create(data);
        }
        return await CandidateModel.create(data);
    },
    findById: async (id) => {
        if (global.isMockDB) {
            return await MockCandidate.findById(id);
        }
        return await CandidateModel.findById(id);
    },
    findByIdAndDelete: async (id) => {
        if (global.isMockDB) {
            return await MockCandidate.findByIdAndDelete(id);
        }
        return await CandidateModel.findByIdAndDelete(id);
    }
};

module.exports = CandidateDelegate;
