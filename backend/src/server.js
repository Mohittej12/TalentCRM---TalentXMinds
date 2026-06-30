const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
    origin: '*',
    exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json());



// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/candidates', require('./routes/candidates'));

// Root route — confirms API is alive
app.get('/', (req, res) => {
    res.json({ message: '🚀 TalentCRM API is running!', status: 'ok' });
});

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'An internal server error occurred' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
