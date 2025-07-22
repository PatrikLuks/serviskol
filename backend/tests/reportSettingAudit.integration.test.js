jest.setTimeout(30000);
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
// Importuj přímo instanci aplikace
let AuditLog, ReportSetting, User, conn;

const AUDIT_LOG_PATH = '/tmp/audit.log';

describe('Audit logování report settings', () => {
  let mongoServer;
  let server, token, userId, settingId, app;

  beforeAll(async () => {
    console.log('DEBUG: Spouštím MongoMemoryServer.create()');
    jest.setTimeout(30000); // zvýšení timeoutu pro tento test
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log('DEBUG: Připojuji vlastní mongoose connection na', uri);
    conn = await mongoose.createConnection(uri);
    console.log('DEBUG: vlastní mongoose connection připojena');

    // --- Schémata přímo v testu ---
    const AuditLogSchema = new mongoose.Schema({
      action: { type: String, required: true },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      details: { type: Object },
      createdAt: { type: Date, default: Date.now }
    });
    const ReportSettingSchema = new mongoose.Schema({
      emails: [String],
      frequency: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
      enabled: { type: Boolean, default: true },
      enabledSections: {
        type: [String],
        default: ['aiSummary','ctrTrend','heatmap']
      },
      dateFrom: { type: Date },
      dateTo: { type: Date },
      scheduledSend: { type: Boolean, default: false },
      lastSentAt: { type: Date },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    ReportSettingSchema.pre('save', function(next) {
      this.updatedAt = new Date();
      next();
    });
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      role: { type: String, enum: ['client', 'mechanic', 'admin'], required: true },
      adminRole: { type: String, enum: ['superadmin', 'approver', 'readonly'], default: 'approver' },
      loyaltyLevel: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
      bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bike' }],
      createdAt: { type: Date, default: Date.now },
      region: { type: String },
      age: { type: Number },
      lastLogin: { type: Date },
      engagementScore: { type: Number, default: 0 },
      pushToken: { type: String },
      notificationChannel: { type: String, enum: ['in-app', 'email', 'push'], default: 'in-app' },
      twoFactorSecret: { type: String },
      twoFactorEnabled: { type: Boolean, default: false },
      campaignClicks: [{
        campaign: { type: String },
        variant: { type: String },
        faq: { type: String },
        clickedAt: { type: Date, default: Date.now },
        channel: { type: String }
      }],
      preferredChannel: { type: String, enum: ['in-app', 'email', 'push', 'sms'], default: 'in-app' },
      channelEngagement: {
        inApp: { type: Number, default: 0 },
        email: { type: Number, default: 0 },
        push: { type: Number, default: 0 },
        sms: { type: Number, default: 0 }
      },
      aiSegment: { type: String, default: 'ostatní' },
      apiKey: { type: String, unique: true, sparse: true },
      apiKeyPermissions: [{ type: String }]
    });


    // Registrace modelů na testovací connection pro DI do app
    const { registerModel } = require('../db');
    AuditLog = registerModel('AuditLog', AuditLogSchema, conn);
    ReportSetting = registerModel('ReportSetting', ReportSettingSchema, conn);
    User = registerModel('User', UserSchema, conn);

    const createApp = require('../server');
    app = createApp({ mongooseConnection: conn });
    server = app.listen(0);
    console.log('DEBUG: server spuštěn');
    // Vytvoření superadmin uživatele a JWT
    await User.deleteMany({ email: 'auditlogtest@example.com' });
    const user = await User.create({
      name: 'Audit Log Test',
      email: 'auditlogtest@example.com',
      passwordHash: 'testheslo',
      role: 'admin',
      adminRole: 'superadmin'
    });
    userId = user._id;
    token = require('jsonwebtoken').sign({ _id: user._id, email: user.email, role: 'admin', adminRole: 'superadmin' }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '1h' });
    // Vyčistit audit logy
    if (fs.existsSync(AUDIT_LOG_PATH)) fs.unlinkSync(AUDIT_LOG_PATH);
    await AuditLog.deleteMany({ performedBy: user._id });
    await ReportSetting.deleteMany({ createdBy: user._id });
    if (fs.existsSync(AUDIT_LOG_PATH)) fs.unlinkSync(AUDIT_LOG_PATH);
    await AuditLog.deleteMany({ performedBy: user._id });
    await ReportSetting.deleteMany({ createdBy: user._id });
    console.log('DEBUG: beforeAll hotovo');
  }, 30000);

  afterAll(async () => {
    await server.close();
    if (conn) await conn.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('audit loguje vytvoření, úpravu a smazání report settingu', async () => {
    jest.setTimeout(30000); // zvýšení timeoutu pro tento test
    // CREATE
    console.log('DEBUG: Odesílám CREATE request');
    let res = await request(server)
      .post('/api/admin/report-settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        emails: ['auditlogtest@example.com'],
        frequency: 'weekly',
        enabled: true,
        enabledSections: ['aiSummary', 'ctrTrend', 'heatmap'],
        scheduledSend: false
      });
    console.log('DEBUG: CREATE response', res.status, res.body);
    expect(res.status).toBe(201);
    settingId = res.body._id;
    await new Promise(r => setTimeout(r, 500));
    // PATCH
    console.log('DEBUG: Odesílám PATCH request');
    res = await request(server)
      .patch(`/api/admin/report-settings/${settingId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ enabled: false });
    console.log('DEBUG: PATCH response', res.status, res.body);
    expect(res.status).toBe(200);
    await new Promise(r => setTimeout(r, 500));
    // DELETE
    console.log('DEBUG: Odesílám DELETE request');
    res = await request(server)
      .delete(`/api/admin/report-settings/${settingId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log('DEBUG: DELETE response', res.status, res.body);
    expect(res.status).toBe(200);
    // Delší zpoždění pro jistotu propsání všech audit logů
    await new Promise(r => setTimeout(r, 3000));
    // Porovnání přes string pro kompatibilitu ObjectId vs string
    let logs = (await AuditLog.find({}).lean()).filter(l => l.details?.settingId?.toString() === settingId.toString());
    console.log('DEBUG: AuditLog entries (1st try)', logs);
    if (logs.length < 3) {
      // Pokud nejsou všechny záznamy, zkus načíst znovu po dalším zpoždění
      await new Promise(r => setTimeout(r, 3000));
      logs = await AuditLog.find({ 'details.settingId': settingId }).lean();
      console.log('DEBUG: AuditLog entries (2nd try)', logs);
    }
    // Výpis všech záznamů v AuditLog pro debugging
    const allLogs = await AuditLog.find({}).lean();
    console.log('DEBUG: Všechny záznamy v AuditLog:', allLogs);
    console.log('DEBUG: settingId použitý v dotazu:', settingId, typeof settingId);
    allLogs.forEach((log, idx) => {
      console.log(`DEBUG: AuditLog[${idx}].details.settingId:`, log.details?.settingId, typeof log.details?.settingId, 'equals?', log.details?.settingId == settingId, 'strict?', log.details?.settingId === settingId);
    });
    expect(logs.length).toBeGreaterThanOrEqual(3);
    const actions = logs.map(l => l.action);
    expect(actions).toContain('Vytvoření report settingu');
    expect(actions).toContain('Úprava report settingu');
    expect(actions).toContain('Smazání report settingu');
  });
});
