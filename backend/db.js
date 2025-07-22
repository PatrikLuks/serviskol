// backend/db.js

// Umožňuje registraci modelů na konkrétní mongoose connection
const mongoose = require('mongoose');

// Uchovávejme registry modelů podle connection id
const modelsRegistry = new Map();

function getConnectionId(conn) {
  // Každá connection má unikátní id
  return conn ? conn.id : mongoose.connection.id;
}

function registerModel(name, schema, conn = mongoose) {
  const id = getConnectionId(conn);
  if (!modelsRegistry.has(id)) modelsRegistry.set(id, {});
  const models = modelsRegistry.get(id);
  if (!models[name]) {
    models[name] = conn.model(name, schema);
  }
  return models[name];
}

function getModel(name, conn = mongoose) {
  const id = getConnectionId(conn);
  const models = modelsRegistry.get(id);
  if (!models || !models[name]) throw new Error(`Model ${name} not registered for this connection!`);
  return models[name];
}

module.exports = {
  mongoose,
  registerModel,
  getModel,
};
