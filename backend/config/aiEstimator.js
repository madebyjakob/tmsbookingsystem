// Central configuration for AI duration estimation
// Adjust values here without touching business logic

module.exports = {
  // Base estimated hours by service type
  serviceTypeBaseHours: {
    repair: 2.5,
    maintenance: 1.5,
    inspection: 1.0,
    other: 2.0
  },

  // Keyword adjustments: if a keyword appears in description, add/subtract hours
  // Multiple matches accumulate. Adjust as needed.
  keywordAdjustments: [
    { pattern: /engine|motor|topplock|kolv|kamrem/i, deltaHours: 1.5 },
    { pattern: /electrical|wiring|alternator|generator/i, deltaHours: 1.0 },
    { pattern: /diagnos|intermittent|intermittent/i, deltaHours: 0.5 },
    { pattern: /brake|broms|bromsar|skiva|belägg/i, deltaHours: 0.5 },
    { pattern: /oil leak|olj[e]?läck/i, deltaHours: 0.5 },
    { pattern: /tire|däck|hjul/i, deltaHours: -0.25 },
    { pattern: /spark plug|tändstift/i, deltaHours: -0.25 },
    { pattern: /chain|kedja|drev/i, deltaHours: 0.25 }
  ],

  // Vehicle year adjustments (older vehicles often take longer)
  vehicleYearAdjustment: function(year) {
    const numeric = parseInt(year, 10);
    if (!numeric) return 0;
    if (numeric <= 2005) return 0.5;
    if (numeric <= 2012) return 0.25;
    return 0;
  },

  // Clamp range for estimates
  minHours: 0.5,
  maxHours: 8.0,

  // Round to nearest X minutes
  roundToMinutes: 15,

  // OpenAI settings (only used if OPENAI_API_KEY is set)
  openAI: {
    enabled: true, // set to false to force heuristic only
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    // System prompt to steer the model to a single numeric output (hours)
    systemPrompt: 'You are a service advisor for moped/motorcycle repairs. Given a task description and vehicle info, output ONLY a single decimal number representing estimated technician hours. No units, no words, just the number. Favor realistic, conservative estimates.'
  }
};


