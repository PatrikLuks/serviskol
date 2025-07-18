// Načte a zaregistruje všechny modely do singletonu
require('./User');
require('./AuditLog');
require('./ReportSetting');
require('./SecurityAlert');
require('./FollowupAutomation');
require('./Prediction');
require('./Campaign');
require('./Segment');
require('./EngagementMetric');
const gamification = require('./Gamification');
// Gamification modely jsou exportovány jako objekt
require('./ServiceRequest');
require('./AlertSetting');
require('./LoyaltyPoints');
require('./Webhook');
require('./Message');
require('./AIMessage');
require('./Notification');
require('./AlertLog');
// ...přidejte další modely dle potřeby
module.exports = {
  ...gamification
};
