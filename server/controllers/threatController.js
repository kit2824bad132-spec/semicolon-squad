const Threat = require('../models/Threat');
const { memoryStore, seedDemoData } = require('../utils/seedData');
const { getIsConnected } = require('../config/db');

exports.getThreats = async (req, res) => {
  try {
    let threats = [];
    if (getIsConnected()) {
      threats = await Threat.find().sort({ detectedAt: -1 });
    } else {
      threats = memoryStore.threats;
    }

    if (!threats || threats.length === 0) {
      await seedDemoData();
      threats = getIsConnected() ? await Threat.find().sort({ detectedAt: -1 }) : memoryStore.threats;
    }

    res.json({
      status: 'SUCCESS',
      count: threats.length,
      threats
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: `Failed to retrieve threats: ${err.message}` });
  }
};
