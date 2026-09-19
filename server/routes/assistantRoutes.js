const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, assistantController.queryAssistant);

module.exports = router;
