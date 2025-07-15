const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Message = require('../models/Message');
const { createNotification } = require('../utils/notificationUtils');
const { sendPushNotification } = require('../utils/pushUtils');
const { captureEvent } = require('../utils/posthog');

// GET /api/chat/:bikeId - načtení historie zpráv ke kolu
router.get('/:bikeId', auth, async (req, res) => {
  try {
    const { bikeId } = req.params;
    const messages = await Message.find({ bikeId }).sort({ createdAt: 1 }).populate('userId', 'name role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// POST /api/chat/:bikeId - odeslání nové zprávy
router.post('/:bikeId', auth, async (req, res) => {
  try {
    const { bikeId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: 'Zpráva nesmí být prázdná.' });
    const message = new Message({ bikeId, userId: req.user.id, text });
    await message.save();
    captureEvent(req.user._id?.toString() || req.user.id, 'chat_message_sent', { bikeId, text });
    // Notifikace pro příjemce (pokud chat je mezi dvěma uživateli)
    if (req.user.role === 'client' && bikeId) {
      const bike = await require('../models/Bike').findById(bikeId);
      if (bike && bike.mechanicId) {
        await createNotification({
          user: bike.mechanicId,
          type: 'chat',
          message: 'Nová zpráva v chatu od klienta.'
        });
        // Push notifikace
        await sendPushNotification(bike.mechanicId, 'Nová zpráva v chatu', 'Máte novou zprávu od klienta.');
      }
    }
    if (req.user.role === 'mechanic' && bikeId) {
      const bike = await require('../models/Bike').findById(bikeId);
      if (bike && bike.ownerId) {
        await createNotification({
          user: bike.ownerId,
          type: 'chat',
          message: 'Nová zpráva v chatu od technika.'
        });
        // Push notifikace
        await sendPushNotification(bike.ownerId, 'Nová zpráva v chatu', 'Máte novou zprávu od technika.');
      }
    }
    res.status(201).json(message);
  } catch (err) {
    captureEvent(req.user._id?.toString() || req.user.id, 'chat_message_error', { bikeId, error: err.message });
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
