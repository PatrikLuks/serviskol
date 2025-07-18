
// Načti .env konfiguraci hned na začátku
require('dotenv').config({ path: __dirname + '/.env' });

// Import všech modelů přes index.js pro správnou registraci singletonů (musí být před require jakýchkoli rout)
require('./models');

const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

function createApp() {
  const express = require('express');
  const helmet = require('helmet');
  const cors = require('cors');
  const rateLimit = require('express-rate-limit');
  const path = require('path');
  const Sentry = require('@sentry/node');
  const promClient = require('prom-client');
  const collectDefaultMetrics = promClient.collectDefaultMetrics;

  // Import všech modelů přes index.js pro správnou registraci singletonů
  require('./models');

  const app = express();
  collectDefaultMetrics();

  // Sentry konfigurace (volitelné, pouze pokud je nastaven SENTRY_DSN)
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      environment: process.env.NODE_ENV || 'development',
    });
    app.use(Sentry.Handlers.requestHandler());
  }

  // ROUTES REGISTRATION (až po inicializaci app)
  app.use('/api/admin', require('./routes/logUnauthorizedRoutes'));
  app.use('/api/admin', require('./routes/aiSecurityAnalysisRoutes'));

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Příliš mnoho požadavků, zkuste to později.' }));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Základní route
  app.get('/', (req, res) => {
    res.send('Serviskol backend běží!');
  });

  // ROUTES REGISTRATION (až po inicializaci app)
  app.use('/api/bi/alerts', require('./routes/biAlertsRoutes'));
  app.use('/api/bi/alerts', require('./routes/biAlertsAiSuggestRoutes'));
  app.use('/api/bi/alerts', require('./routes/biAlertsActivateVariantRoutes'));
  app.use('/api/bi/variant-trend-prediction', require('./routes/biVariantTrendPredictionRoutes'));
  app.use('/api/bi/next-best-action', require('./routes/biNextBestActionRoutes'));
  app.use('/api/bi', require('./routes/followupHistoryExport'));
  app.use('/api/bi', require('./routes/followupPredictBestVariant'));
  app.use('/api/admin/followup-automation', require('./routes/followupAutomationAiRoutes'));
  app.use('/api/bi', require('./routes/followupEffectivenessRoutes'));
  app.use('/api/admin/followup-automation', require('./routes/followupAutomationRoutes'));
  app.use('/api/bi', require('./routes/biDocsRoutes'));
  app.use('/api/admin/webhooks', require('./routes/webhookRoutes'));
  app.use('/api/admin/api-keys', require('./routes/apiKeyRoutes'));
  app.use('/api/bi', require('./routes/biRoutes'));
  app.use('/api/admin/report-settings', require('./routes/reportSettingRoutes'));
  app.use('/api/click', require('./routes/clickRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/admin', require('./routes/securityAuditRoutes'));
  app.use('/api/admin', require('./routes/followupMetrics'));

  // Další routes ...
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/bikes', require('./routes/bikeRoutes'));
  app.use('/api/intake', require('./routes/intakeRoutes'));
  app.use('/api/chat', require('./routes/chatRoutes'));
  app.use('/api/loyalty', require('./routes/loyaltyRoutes'));
  app.use('/api/export', require('./routes/exportRoutes'));
  app.use('/api/integrations', require('./routes/integrationsRoutes'));
  app.use('/api/analytics', require('./routes/analyticsRoutes'));
  app.use('/api/feedback', require('./routes/feedbackRoutes'));
  app.use('/api/integrations', require('./routes/stravaRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));

  // app.use(Sentry.Handlers.errorHandler());
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }

  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);



  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  });

  return app;
}

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB().then(() => {
    const app = createApp();
    app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
  });
}

module.exports = { createApp };
