const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// @route   GET /api/candidates
// @desc    Get candidates with search by name and filter by status
// @access  Private
router.get('/', async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (status && status !== 'All') {
            query.status = status;
        }

        const candidates = await Candidate.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: candidates.length, data: candidates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/candidates
// @desc    Create a candidate
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { name, email, role, status, experience, phone, location, source, priority, notes } = req.body;

        if (!name || !email || !role || experience === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide name, email, role, and experience' });
        }

        const candidate = await Candidate.create({
            name, email, role,
            status: status || 'Applied',
            experience,
            phone, location, source, priority, notes,
        });

        res.status(201).json({ success: true, data: candidate });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/candidates/:id
// @desc    Update a candidate
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const { name, email, role, status, experience, phone, location, source, priority, notes } = req.body;
        let candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        if (name) candidate.name = name;
        if (email) candidate.email = email;
        if (role) candidate.role = role;
        if (status) candidate.status = status;
        if (experience !== undefined) candidate.experience = experience;
        if (phone !== undefined) candidate.phone = phone;
        if (location !== undefined) candidate.location = location;
        if (source) candidate.source = source;
        if (priority) candidate.priority = priority;
        if (notes !== undefined) candidate.notes = notes;

        await candidate.save();
        res.json({ success: true, data: candidate });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate (and their resume)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({ success: false, message: 'Candidate not found' });
        }

        await Candidate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
