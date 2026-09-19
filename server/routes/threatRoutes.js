const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, threatController.getThreats);

module.exports = router;
