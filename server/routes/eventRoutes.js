const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

// Multer upload setup
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

router.post('/upload', authMiddleware, upload.single('file'), eventController.uploadCSV);
router.get('/', authMiddleware, eventController.getEvents);
router.post('/', authMiddleware, eventController.createEvent);
router.post('/analyze', authMiddleware, eventController.analyzeEvents);

module.exports = router;
