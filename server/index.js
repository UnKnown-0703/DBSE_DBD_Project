const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { router: authRouter } = require('./routes/auth');
const adminRouter = require('./routes/admin');
const facultyRouter = require('./routes/faculty');
const studentRouter = require('./routes/student');
const bulkRouter = require('./routes/bulk');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // For development purposes, allow connections from any domain (e.g., frontend Vite dev server)
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/faculty', facultyRouter);
app.use('/api/student', studentRouter);
app.use('/api/bulk', bulkRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Backend Server is running on http://127.0.0.1:${PORT}`);
});
