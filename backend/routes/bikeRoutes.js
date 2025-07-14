const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Bike = require('../models/Bike');
const ServiceRequest = require('../models/ServiceRequest');
const multer = require('multer');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const auditLog = require('../middleware/auditLog');
const { createNotification } = require('../utils/notificationUtils');
const { sendPushNotification } = require('../utils/pushUtils');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET /api/bikes - seznam kol přihlášeného uživatele
router.get('/', auth, async (req, res) => {
  try {
    const bikes = await Bike.find({ ownerId: req.user.id });
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Přidání nového kola
router.post('/', auth, async (req, res) => {
  try {
    const { brand, model, type, age } = req.body;
    if (!brand || !model || !type) {
      return res.status(400).json({ msg: 'Vyplňte všechna povinná pole.' });
    }
    const bike = new Bike({
      ownerId: req.user.id,
      brand,
      model,
      type,
      age,
      components: [],
      photoUrls: [],
      status: 'OK',
      mileage: 0,
      serviceHistory: []
    });
    await bike.save();
    res.status(201).json(bike);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Detail kola včetně komponent a servisní historie
router.get('/:id', auth, async (req, res) => {
  try {
    const bike = await Bike.findOne({ _id: req.params.id, ownerId: req.user.id })
      .populate('serviceHistory');
    if (!bike) return res.status(404).json({ msg: 'Kolo nebylo nalezeno.' });
    res.json(bike);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Přidání servisního záznamu ke kolu
router.post('/:id/service', auth, async (req, res) => {
  try {
    const { type, description, status } = req.body;
    if (!type || !status) {
      return res.status(400).json({ msg: 'Vyplňte typ a stav servisu.' });
    }
    const bike = await Bike.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!bike) return res.status(404).json({ msg: 'Kolo nebylo nalezeno.' });
    const service = new ServiceRequest({
      bikeId: bike._id,
      userId: req.user.id,
      type,
      description,
      status,
      createdAt: new Date()
    });
    await service.save();
    bike.serviceHistory.push(service._id);
    await bike.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Editace servisního záznamu
router.put('/:bikeId/service/:serviceId', auth, async (req, res) => {
  try {
    const { bikeId, serviceId } = req.params;
    const service = await ServiceRequest.findOne({ _id: serviceId, bikeId });
    if (!service) return res.status(404).json({ msg: 'Servisní záznam nenalezen.' });
    // Pouze vlastník kola nebo technik
    if (service.userId.toString() !== req.user.id && req.user.role !== 'mechanic' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Nemáte oprávnění.' });
    }
    const allowedFields = ['type', 'description', 'aiDiagnosis', 'startTime', 'endTime', 'priceEstimate'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) service[field] = req.body[field];
    });
    let notifyUser = false;
    let notifyMechanic = false;
    let auditAction = null;
    let auditDetails = {};
    // Změna stavu a historie
    if (req.body.status && req.body.status !== service.status) {
      service.status = req.body.status;
      service.statusHistory = service.statusHistory || [];
      service.statusHistory.push({ status: req.body.status, changedAt: new Date(), changedBy: req.user.id });
      notifyUser = true;
      auditAction = 'Změna stavu servisu';
      auditDetails = { serviceId, newStatus: req.body.status };
    }
    // Přiřazení technika
    if (req.body.mechanicId && req.body.mechanicId !== String(service.mechanicId)) {
      service.mechanicId = req.body.mechanicId;
      notifyMechanic = true;
      auditAction = 'Přiřazení technika';
      auditDetails = { serviceId, mechanicId: req.body.mechanicId };
    }
    await service.save();
    // Audit log
    if (auditAction) {
      auditLog(auditAction, req.user, auditDetails);
    }
    // Odeslání e-mailu uživateli
    if (notifyUser) {
      const userObj = await User.findById(service.userId);
      if (userObj) {
        await sendEmail({
          to: userObj.email,
          subject: 'Změna stavu servisu',
          text: `Váš servisní požadavek změnil stav na: ${service.status}`
        });
        await createNotification({
          user: userObj._id,
          type: 'service',
          message: `Stav vašeho servisu byl změněn na: ${service.status}`
        });
        // Push notifikace
        await sendPushNotification(userObj._id, 'Změna stavu servisu', `Stav vašeho servisu: ${service.status}`);
      }
    }
    // Odeslání e-mailu technikovi
    if (notifyMechanic) {
      const mechanicObj = await User.findById(service.mechanicId);
      if (mechanicObj) {
        await sendEmail({
          to: mechanicObj.email,
          subject: 'Byl vám přiřazen servisní požadavek',
          text: `Byl vám přiřazen nový servisní požadavek na kolo.`
        });
        // Vytvoření in-app notifikace
        await createNotification({
          user: mechanicObj._id,
          type: 'service',
          message: `Byl vám přiřazen nový servisní požadavek.`
        });
      }
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Smazání servisního záznamu
router.delete('/:bikeId/service/:serviceId', auth, async (req, res) => {
  try {
    const { bikeId, serviceId } = req.params;
    const service = await ServiceRequest.findOne({ _id: serviceId, bikeId });
    if (!service) return res.status(404).json({ msg: 'Servisní záznam nenalezen.' });
    // Pouze vlastník kola nebo technik
    if (service.userId.toString() !== req.user.id && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Nemáte oprávnění.' });
    }
    await ServiceRequest.deleteOne({ _id: serviceId });
    // Odstranění reference ze serviceHistory v kole
    await Bike.updateOne(
      { _id: bikeId },
      { $pull: { serviceHistory: serviceId } }
    );
    res.json({ msg: 'Servisní záznam byl smazán.' });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Přidání komponenty ke kolu
router.post('/:id/component', auth, async (req, res) => {
  try {
    const { name, type, condition, installedAt, expectedLifetimeKm } = req.body;
    if (!name || !type || !condition) {
      return res.status(400).json({ msg: 'Vyplňte všechna povinná pole komponenty.' });
    }
    const bike = await Bike.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!bike) return res.status(404).json({ msg: 'Kolo nebylo nalezeno.' });
    const component = { name, type, condition, installedAt, expectedLifetimeKm };
    bike.components.push(component);
    await bike.save();
    res.status(201).json(component);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Úprava komponenty kola
router.put('/:id/component/:index', auth, async (req, res) => {
  try {
    const { name, type, condition, installedAt, expectedLifetimeKm } = req.body;
    const bike = await Bike.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!bike) return res.status(404).json({ msg: 'Kolo nebylo nalezeno.' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0 || idx >= bike.components.length) {
      return res.status(404).json({ msg: 'Komponenta nebyla nalezena.' });
    }
    bike.components[idx] = { name, type, condition, installedAt, expectedLifetimeKm };
    await bike.save();
    res.json(bike.components[idx]);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Smazání komponenty kola
router.delete('/:id/component/:index', auth, async (req, res) => {
  try {
    const bike = await Bike.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!bike) return res.status(404).json({ msg: 'Kolo nebylo nalezeno.' });
    const idx = parseInt(req.params.index, 10);
    if (isNaN(idx) || idx < 0 || idx >= bike.components.length) {
      return res.status(404).json({ msg: 'Komponenta nebyla nalezena.' });
    }
    bike.components.splice(idx, 1);
    await bike.save();
    res.json({ msg: 'Komponenta byla smazána.' });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// Upload fotky k servisnímu záznamu
router.post('/:bikeId/service/:serviceId/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    const { bikeId, serviceId } = req.params;
    const service = await ServiceRequest.findOne({ _id: serviceId, bikeId });
    if (!service) return res.status(404).json({ msg: 'Servisní záznam nenalezen.' });
    if (service.userId.toString() !== req.user.id && req.user.role !== 'mechanic') {
      return res.status(403).json({ msg: 'Nemáte oprávnění.' });
    }
    if (!req.file) return res.status(400).json({ msg: 'Soubor nebyl nahrán.' });
    const photoUrl = `/uploads/${req.file.filename}`;
    service.photoUrls = service.photoUrls || [];
    service.photoUrls.push(photoUrl);
    await service.save();
    res.json({ msg: 'Fotka nahrána.', photoUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
