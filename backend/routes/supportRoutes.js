const express = require('express');
const router = express.Router();
const { auditLog } = require('../middleware/auditLog');
const { captureEvent } = require('../utils/posthog');
const { auth } = require('../middleware/auth');
const sendUserNotification = require('../utils/sendUserNotification');

// POST /api/support/ticket
const sendEmail = require('../utils/sendEmail');
router.post('/ticket', auth, async (req, res) => {
  const { message, aiMessageId } = req.body;
  if (!message) return res.status(400).json({ error: 'Chybí zpráva.' });
  const user = req.user;
  auditLog('Podpora - nový ticket', user, { message, aiMessageId });
  captureEvent(user._id?.toString() || user.id, 'support_ticket_created', { message, aiMessageId });

  // Odeslat e-mail administrátorovi
  const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || 'serviskol@demo.cz';
  try {
    await sendEmail({
      to: adminEmail,
      subject: 'Nový požadavek na podporu',
      text: `Nový ticket od uživatele ${user.email || user.id} (ID: ${user._id || user.id}):\n\n${message}\n\nAI Message ID: ${aiMessageId || 'neuvedeno'}`
    });
  } catch (e) {
    // Log error, ale neblokuje odpověď
    console.error('Chyba při odesílání e-mailu administrátorovi:', e);
  }

  // Notifikace uživateli o přijetí ticketu
  if (user.email) {
    await sendUserNotification(user, 'Váš požadavek byl přijat', 'Děkujeme za zaslání požadavku na podporu. Ozveme se vám co nejdříve.');
  }
  res.json({ success: true, msg: 'Váš požadavek byl přijat. Ozveme se vám co nejdříve.' });
});

// POST /api/support/close-ticket
const sendEmail = require('../utils/sendEmail');
router.post('/close-ticket', auth, async (req, res) => {
  const { ticketId, satisfaction, comment } = req.body;
  if (!ticketId) {
    return res.status(400).json({ error: 'Chybí ticketId.' });
  }
  const user = req.user;
  auditLog('Podpora - ticket uzavřen', user, { ticketId, satisfaction, comment });
  const { captureEvent } = require('../utils/posthog');
  captureEvent(user._id?.toString() || user.id, 'support_ticket_closed', { ticketId, satisfaction, comment });
  // Pokud není zadáno hodnocení, pošleme follow-up notifikaci (zatím e-mail)
  if (typeof satisfaction !== 'number' && user.email) {
    await sendUserNotification(
      user,
      'Vyřešení vašeho požadavku na podporu',
      `Dobrý den,\n\nVáš požadavek na podporu (ticket ${ticketId}) byl uzavřen.\n\nBudeme rádi, když nám dáte vědět, jak jste byli spokojeni s řešením. Odpovězte prosím na tento e-mail nebo ohodnoťte v aplikaci.\n\nDěkujeme, tým ServisKol.`
    );
  }
  res.json({ success: true });
});

module.exports = router;
