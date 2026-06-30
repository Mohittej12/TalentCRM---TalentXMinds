const bcrypt = require('bcryptjs');

// In-memory arrays to persist data during the server session
const mockUsers = [];
const mockCandidates = [];

const MockUser = {
    findOne: async ({ email }) => {
        const index = mockUsers.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (index === -1) return null;
        const user = mockUsers[index];

        return {
            ...user,
            matchPassword: async (enteredPassword) => {
                return await bcrypt.compare(enteredPassword, user.password);
            },
            save: async function () {
                if (this.password && this.password !== user.password) {
                    const salt = await bcrypt.genSalt(10);
                    this.password = await bcrypt.hash(this.password, salt);
                }
                mockUsers[index] = { ...user, ...this };
                return mockUsers[index];
            }
        };
    },

    create: async ({ name, email, password, ...rest }) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            _id: 'mock_u_' + Math.random().toString(36).substr(2, 9),
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            ...rest,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        mockUsers.push(newUser);
        return newUser;
    },

    findById: async (id) => {
        const index = mockUsers.findIndex(u => u._id === id);
        if (index === -1) return null;
        const user = mockUsers[index];
        return {
            ...user,
            save: async function () {
                if (this.password && this.password !== user.password) {
                    const salt = await bcrypt.genSalt(10);
                    this.password = await bcrypt.hash(this.password, salt);
                }
                mockUsers[index] = { ...user, ...this };
                return mockUsers[index];
            }
        };
    }
};

const MockCandidate = {
    findOne: async (query) => {
        if (!query) return null;
        const key = Object.keys(query)[0];
        const val = query[key];
        const index = mockCandidates.findIndex(c => c[key] === val);
        if (index === -1) return null;
        return mockCandidates[index];
    },

    find: (query = {}) => {
        let filtered = [...mockCandidates];

        // Emulate search regex query
        if (query.name && query.name.$regex) {
            const reg = new RegExp(query.name.$regex, 'i');
            filtered = filtered.filter(c => reg.test(c.name));
        }

        // Emulate status query
        if (query.status) {
            filtered = filtered.filter(c => c.status === query.status);
        }

        // Emulate query chain sorting `.sort({ createdAt: -1 })`
        return {
            sort: (sortCriteria) => {
                if (sortCriteria && sortCriteria.createdAt) {
                    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                }
                return filtered;
            }
        };
    },

    create: async (data) => {
        const { name, email, role, status, experience, phone, location, source, priority, notes } = data;
        const newCand = {
            _id: 'mock_cand_' + Math.random().toString(36).substr(2, 9),
            name,
            email,
            role,
            status: status || 'Applied',
            experience: Number(experience),
            phone,
            location,
            source: source || 'LinkedIn',
            priority: priority || 'Normal',
            notes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockCandidates.push(newCand);
        return newCand;
    },

    findById: async (id) => {
        const index = mockCandidates.findIndex(c => c._id === id);
        if (index === -1) return null;
        const cand = mockCandidates[index];

        // Return candidate object wrapping a .save() function
        return {
            ...cand,
            save: async function () {
                mockCandidates[index] = {
                    ...cand,
                    name: this.name !== undefined ? this.name : cand.name,
                    email: this.email !== undefined ? this.email : cand.email,
                    role: this.role !== undefined ? this.role : cand.role,
                    status: this.status !== undefined ? this.status : cand.status,
                    experience: this.experience !== undefined ? Number(this.experience) : cand.experience,
                    phone: this.phone !== undefined ? this.phone : cand.phone,
                    location: this.location !== undefined ? this.location : cand.location,
                    source: this.source !== undefined ? this.source : cand.source,
                    priority: this.priority !== undefined ? this.priority : cand.priority,
                    notes: this.notes !== undefined ? this.notes : cand.notes,
                    updatedAt: new Date(),
                };
                return mockCandidates[index];
            }
        };
    },

    findByIdAndDelete: async (id) => {
        const index = mockCandidates.findIndex(c => c._id === id);
        if (index === -1) return null;
        const deleted = mockCandidates.splice(index, 1)[0];
        return deleted;
    }
};

module.exports = { MockUser, MockCandidate };
