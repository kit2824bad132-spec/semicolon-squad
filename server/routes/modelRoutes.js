const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const authMiddleware = require('../middleware/auth');

router.get('/dashboard', authMiddleware, modelController.getDashboardData);
router.post('/model/retrain', authMiddleware, modelController.retrainModel);
router.post('/reports', authMiddleware, modelController.generateReport);
router.get('/reports/:id', authMiddleware, modelController.getReportById);

module.exports = router;
