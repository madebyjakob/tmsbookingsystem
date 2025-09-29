const fs = require('fs');
const path = require('path');
const baseConfig = require('../config/aiEstimator');
const runtimePath = path.join(__dirname, '..', 'config', 'aiEstimator.runtime.json');

function loadRuntimeOverrides() {
  try {
    const raw = fs.readFileSync(runtimePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function mergeConfig() {
  const overrides = loadRuntimeOverrides();
  // Preserve RegExp and functions from base config
  const merged = {
    ...baseConfig,
    serviceTypeBaseHours: { ...baseConfig.serviceTypeBaseHours },
    keywordAdjustments: [...baseConfig.keywordAdjustments],
    openAI: { ...baseConfig.openAI }
  };

  if (overrides.serviceTypeBaseHours) {
    Object.assign(merged.serviceTypeBaseHours, overrides.serviceTypeBaseHours);
  }
  if (Array.isArray(overrides.keywordAdjustments) && overrides.keywordAdjustments.length > 0) {
    merged.keywordAdjustments = overrides.keywordAdjustments.map(r => ({
      pattern: new RegExp(r.pattern, r.flags || 'i'),
      deltaHours: r.deltaHours
    }));
  }
  if (typeof overrides.minHours === 'number') merged.minHours = overrides.minHours;
  if (typeof overrides.maxHours === 'number') merged.maxHours = overrides.maxHours;
  if (typeof overrides.roundToMinutes === 'number') merged.roundToMinutes = overrides.roundToMinutes;
  if (overrides.openAI) {
    merged.openAI = { ...merged.openAI, ...overrides.openAI };
  }

  return merged;
}

let config = mergeConfig();

// Expose helpers to get and set config
function getEffectiveConfig() {
  config = mergeConfig();
  return config;
}

function saveRuntimeOverrides(newOverrides) {
  // Persist simple JSON, convert RegExp to serializable objects
  const serializable = { ...newOverrides };
  if (Array.isArray(serializable.keywordAdjustments)) {
    serializable.keywordAdjustments = serializable.keywordAdjustments.map(rule => {
      if (rule.pattern instanceof RegExp) {
        return { pattern: rule.pattern.source, flags: rule.pattern.flags, deltaHours: rule.deltaHours };
      }
      return rule;
    });
  }
  fs.writeFileSync(runtimePath, JSON.stringify(serializable, null, 2), 'utf8');
  config = mergeConfig();
  return config;
}

// Lazily initialize OpenAI to avoid requiring key at boot
let openAIClient = null;
function getOpenAIClient() {
  if (!config.openAI.enabled) return null;
  if (!process.env.OPENAI_API_KEY) return null;
  if (openAIClient) return openAIClient;

  try {
    const OpenAI = require('openai');
    openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openAIClient;
  } catch (err) {
    return null;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundToMinutes(hours, minutes) {
  const roundHours = minutes / 60;
  return Math.round(hours / roundHours) * roundHours;
}

function heuristicEstimate({ serviceType, vehicleYear, description }) {
  const cfg = getEffectiveConfig();
  const base = cfg.serviceTypeBaseHours[serviceType] ?? cfg.serviceTypeBaseHours.other;
  let estimate = base;

  if (description) {
    for (const rule of cfg.keywordAdjustments) {
      if (rule.pattern.test(description)) {
        estimate += rule.deltaHours;
      }
    }
  }

  estimate += cfg.vehicleYearAdjustment(vehicleYear);

  estimate = clamp(estimate, cfg.minHours, cfg.maxHours);
  estimate = roundToMinutes(estimate, cfg.roundToMinutes);
  return Number(estimate.toFixed(2));
}

async function openAIEstimate({ serviceType, vehicleMake, vehicleModel, vehicleYear, description }) {
  const cfg = getEffectiveConfig();
  const client = getOpenAIClient();
  if (!client) return null;

  const userPrompt = [
    `Service type: ${serviceType}`,
    `Vehicle: ${vehicleMake} ${vehicleModel} (${vehicleYear || 'unknown year'})`,
    `Task description: ${description}`,
    'Output only a single number in hours, e.g. 2.5'
  ].join('\n');

  try {
    const response = await client.chat.completions.create({
      model: cfg.openAI.model,
      temperature: cfg.openAI.temperature,
      messages: [
        { role: 'system', content: cfg.openAI.systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const content = response?.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const numeric = parseFloat(content.replace(/[^0-9.]/g, ''));
    if (!isFinite(numeric)) return null;

    const clamped = clamp(numeric, cfg.minHours, cfg.maxHours);
    const rounded = roundToMinutes(clamped, cfg.roundToMinutes);
    return Number(rounded.toFixed(2));
  } catch (err) {
    return null;
  }
}

async function estimateDuration({ serviceType, vehicleMake, vehicleModel, vehicleYear, description }) {
  const aiEstimate = await openAIEstimate({ serviceType, vehicleMake, vehicleModel, vehicleYear, description });
  if (aiEstimate !== null) return aiEstimate;
  return heuristicEstimate({ serviceType, vehicleYear, description });
}

module.exports = { estimateDuration, heuristicEstimate, getEffectiveConfig, saveRuntimeOverrides };


