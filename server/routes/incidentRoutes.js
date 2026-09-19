const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, incidentController.getIncidents);
router.post('/', authMiddleware, incidentController.createIncident);
router.get('/:id', authMiddleware, incidentController.getIncidentById);
router.put('/:id', authMiddleware, incidentController.updateIncident);
router.post('/:id/investigate', authMiddleware, incidentController.investigateIncident);
router.post('/:id/feedback', authMiddleware, incidentController.submitFeedback);
router.post('/:id/response', authMiddleware, incidentController.executeResponseAction);
router.post('/:id/explain-ai', authMiddleware, incidentController.explainWithAI);

module.exports = router;
