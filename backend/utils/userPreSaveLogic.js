// Čistá funkce pro logiku pre-save hooku User modelu
module.exports = async function userPreSaveLogic(user, deps = {}) {
  const {
    AuditLog = require('../models/AuditLog'),
    Webhook = require('../models/Webhook'),
    webhookTrigger = require('../utils/webhookTrigger'),
    FollowupAutomation = require('../models/FollowupAutomation'),
    Notification = require('../models/Notification'),
    now = () => new Date()
  } = deps;

  // Audit log a webhook trigger při změně AI segmentu
  if (user._isModifiedAiSegment && !user._isNew) {
    try {
      await AuditLog.create({
        action: 'ai_segment_change',
        performedBy: user._id,
        details: { newSegment: user.aiSegment, user: user._id }
      });
      // Trigger webhooky na změnu segmentu (pokud existují)
      const webhooks = await Webhook.find({ event: 'ai_segment_change', active: true });
      for (const w of webhooks) {
        webhookTrigger(w, { userId: user._id, newSegment: user.aiSegment });
      }
      // Automatizovaný follow-up při přechodu do rizikového segmentu
      if (user.aiSegment === 'riziko_odchodu') {
        const automations = await FollowupAutomation.find({ triggerSegment: 'riziko_odchodu', active: true });
        for (const a of automations) {
          // A/B testování: pokud jsou varianty, vyber náhodně jednu aktivní
          let variant = null;
          if (Array.isArray(a.variants) && a.variants.length > 0) {
            const activeVariants = a.variants.filter(v => v.active !== false);
            if (activeVariants.length > 0) {
              variant = activeVariants[Math.floor(Math.random() * activeVariants.length)];
            }
          }
          // fallback na původní messageTemplate
          const message = variant ? variant.messageTemplate : a.messageTemplate;
          if (a.channel === 'in-app') {
            await Notification.create({
              user: user._id,
              type: 'followup',
              message,
              variant: variant?.label,
              createdAt: now()
            });
          }
          // TODO: email, push, další kanály
        }
      }
    } catch (e) { /* ignore */ }
  }
}
