const express = require('express');
const router = express.Router();
const { estimateDuration, getEffectiveConfig, saveRuntimeOverrides } = require('../services/aiEstimatorService');

// POST /api/ai/estimate-duration
// Body: { serviceType, vehicleMake, vehicleModel, vehicleYear, description }
router.post('/estimate-duration', async (req, res, next) => {
  try {
    const { serviceType, vehicleMake, vehicleModel, vehicleYear, description } = req.body || {};

    if (!serviceType || !description) {
      return res.status(400).json({ error: 'serviceType and description are required' });
    }

    const result = await estimateDuration({
      serviceType,
      vehicleMake: vehicleMake || '',
      vehicleModel: vehicleModel || '',
      vehicleYear: vehicleYear || '',
      description
    });

    res.json({ estimatedHours: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// GET /api/ai/config - returns effective config (base + overrides)
router.get('/config', (req, res, next) => {
  try {
    const cfg = getEffectiveConfig();
    // Convert RegExp to strings for transport
    const keywordAdjustments = cfg.keywordAdjustments.map(r => ({ pattern: r.pattern.source, flags: r.pattern.flags, deltaHours: r.deltaHours }));
    res.json({
      serviceTypeBaseHours: cfg.serviceTypeBaseHours,
      keywordAdjustments,
      minHours: cfg.minHours,
      maxHours: cfg.maxHours,
      roundToMinutes: cfg.roundToMinutes,
      openAI: {
        enabled: cfg.openAI.enabled,
        model: cfg.openAI.model,
        temperature: cfg.openAI.temperature
      }
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/ai/config - updates runtime overrides
router.put('/config', (req, res, next) => {
  try {
    const overrides = req.body || {};
    const newCfg = saveRuntimeOverrides(overrides);
    const keywordAdjustments = newCfg.keywordAdjustments.map(r => ({ pattern: r.pattern.source, flags: r.pattern.flags, deltaHours: r.deltaHours }));
    res.json({
      serviceTypeBaseHours: newCfg.serviceTypeBaseHours,
      keywordAdjustments,
      minHours: newCfg.minHours,
      maxHours: newCfg.maxHours,
      roundToMinutes: newCfg.roundToMinutes,
      openAI: {
        enabled: newCfg.openAI.enabled,
        model: newCfg.openAI.model,
        temperature: newCfg.openAI.temperature
      }
    });
  } catch (error) {
    next(error);
  }
});


