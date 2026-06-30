const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MockUser } = require('./MockStore');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifyOTP: { type: String },
        verifyOTPExpiry: { type: Date },
        resetOTP: { type: String },
        resetOTPExpiry: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model('User', userSchema);

const UserDelegate = {
    findOne: async (query) => {
        if (global.isMockDB) return await MockUser.findOne(query);
        return await UserModel.findOne(query);
    },
    create: async (data) => {
        if (global.isMockDB) return await MockUser.create(data);
        return await UserModel.create(data);
    },
    findById: async (id) => {
        if (global.isMockDB) return await MockUser.findById(id);
        return await UserModel.findById(id);
    },
    findByIdAndUpdate: async (id, update, options = {}) => {
        if (global.isMockDB) return null;
        return await UserModel.findByIdAndUpdate(id, update, options);
    },
};

module.exports = UserDelegate;
