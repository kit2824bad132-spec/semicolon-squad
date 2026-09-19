const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const { seedDemoData } = require('./utils/seedData');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const threatRoutes = require('./routes/threatRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const modelRoutes = require('./routes/modelRoutes');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS & Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'CyberAI Main Node.js/Express Backend',
    mode: '● SYSTEM ONLINE | SIMULATION MODE',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api', modelRoutes); // Handles /api/dashboard, /api/model/retrain, /api/reports

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ status: 'ERROR', message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ status: 'ERROR', message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
  await connectDB();
  await seedDemoData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 CyberAI Express API Server running on port ${PORT}`);
    console.log(`● SYSTEM ONLINE | SIMULATION MODE`);
    console.log(`=======================================================`);
  });
};

startServer();
