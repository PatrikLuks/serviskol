// Základní Express server pro Serviskol
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });
const Sentry = require('@sentry/node');
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;

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

// Middleware
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Příliš mnoho požadavků, zkuste to později.' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Připojení k databázi
connectDB();

// Základní route
app.get('/', (req, res) => {
  res.send('Serviskol backend běží!');
});

// TODO: Přidat routes pro kola, servisní požadavky

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const bikeRoutes = require('./routes/bikeRoutes');
app.use('/api/bikes', bikeRoutes);

const intakeRoutes = require('./routes/intakeRoutes');
app.use('/api/intake', intakeRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const loyaltyRoutes = require('./routes/loyaltyRoutes');
app.use('/api/loyalty', loyaltyRoutes);

const exportRoutes = require('./routes/exportRoutes');
app.use('/api/export', exportRoutes);
const integrationsRoutes = require('./routes/integrationsRoutes');
app.use('/api/integrations', integrationsRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const feedbackRoutes = require('./routes/feedbackRoutes');
app.use('/api/feedback', feedbackRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const pushRoutes = require('./routes/pushRoutes');
app.use('/api/users', pushRoutes);

const auditRoutes = require('./routes/auditRoutes');
app.use('/api/audit', auditRoutes);

const auditLogViewRoutes = require('./routes/auditLogViewRoutes');
app.use('/api/audit', auditLogViewRoutes);

const gdprRoutes = require('./routes/gdprRoutes');
app.use('/api/gdpr', gdprRoutes);

const gdprAdminRoutes = require('./routes/gdprAdminRoutes');
app.use('/api/gdpr', gdprAdminRoutes);

const twofaRoutes = require('./routes/twofaRoutes');
app.use('/api/2fa', twofaRoutes);

const healthRoutes = require('./routes/healthRoutes');
app.use('/api/health', healthRoutes);

const gamificationRoutes = require('./routes/gamificationRoutes');
app.use('/api/gamification', gamificationRoutes);

const stravaRoutes = require('./routes/stravaRoutes');
app.use('/api/integrations', stravaRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

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

const PORT = process.env.PORT || 5000;
console.log('Před app.listen');
app.listen(PORT, () => console.log(`Server běží na portu ${PORT}`));
console.log('Za app.listen');

module.exports = app;
