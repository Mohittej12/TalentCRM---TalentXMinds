const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_fallback_key_123';

// Helper: generate JWT
const generateToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// Helper: generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: OTP expiry (15 min from now)
const otpExpiry = () => new Date(Date.now() + 15 * 60 * 1000);

// ─────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ success: false, message: 'User already exists' });

        const otp = generateOTP();
        const user = await User.create({
            name, email, password,
            isVerified: false,
            verifyOTP: otp,
            verifyOTPExpiry: otpExpiry(),
        });

        await sendOTPEmail(email, otp, 'verify');

        res.status(201).json({ success: true, needsVerification: true, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/verify-email
// ─────────────────────────────────────
router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified' });
        if (!user.verifyOTP || user.verifyOTP !== otp)
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        if (user.verifyOTPExpiry < new Date())
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

        user.isVerified = true;
        user.verifyOTP = undefined;
        user.verifyOTPExpiry = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully!',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/resend-verification
// ─────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ success: false, message: 'Account already verified' });

        const otp = generateOTP();
        user.verifyOTP = otp;
        user.verifyOTPExpiry = otpExpiry();
        await user.save();

        await sendOTPEmail(email, otp, 'verify');
        res.json({ success: true, message: 'Verification code resent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Please provide email and password' });

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        if (!user.isVerified)
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in', needsVerification: true, email: user.email });

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always respond OK to prevent email enumeration
        if (!user) return res.json({ success: true, message: 'If that email exists, a reset code was sent.' });

        const otp = generateOTP();
        user.resetOTP = otp;
        user.resetOTPExpiry = otpExpiry();
        await user.save();

        await sendOTPEmail(email, otp, 'reset');
        res.json({ success: true, message: 'Password reset code sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/verify-reset-otp
// ─────────────────────────────────────
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.resetOTP || user.resetOTP !== otp)
            return res.status(400).json({ success: false, message: 'Invalid OTP code' });
        if (user.resetOTPExpiry < new Date())
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });

        // Issue a short-lived reset token
        const resetToken = jwt.sign({ id: user._id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '10m' });

        user.resetOTP = undefined;
        user.resetOTPExpiry = undefined;
        await user.save();

        res.json({ success: true, resetToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ─────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword)
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        if (newPassword.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch {
            return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
        }

        if (decoded.purpose !== 'reset')
            return res.status(400).json({ success: false, message: 'Invalid reset token' });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
