// Stav poslední eskalace incidentu (demo, v produkci by bylo v DB)
let lastEscalation = null;

function setLastEscalation(escalation) {
  lastEscalation = { ...escalation, timestamp: new Date() };
}

function getLastEscalation() {
  return lastEscalation;
}

module.exports = { setLastEscalation, getLastEscalation };
