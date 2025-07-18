// backend/db.js
// Singleton pro mongoose a modely
const mongoose = require('mongoose');

// Uchovávejme registry modelů, abychom zabránili duplikaci
const models = {};

function registerModel(name, schema) {
  if (!models[name]) {
    models[name] = mongoose.model(name, schema);
  }
  return models[name];
}

function getModel(name) {
  if (!models[name]) throw new Error(`Model ${name} not registered!`);
  return models[name];
}

module.exports = {
  mongoose,
  registerModel,
  getModel,
};
