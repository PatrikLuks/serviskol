const request = require('supertest');
const { mongoose } = require('../db');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');
const { createApp } = require('../server');
const { getModel } = require('../db');
let AuditLog, ReportSetting, User;

const AUDIT_LOG_PATH = '/tmp/audit.log';

describe('Audit logování report settings', () => {
  let mongoServer;
  let server, token, userId, settingId, app;

beforeAll(async () => {
    console.log('DEBUG: Spouštím MongoMemoryServer.create()');
    jest.setTimeout(30000); // zvýšení timeoutu pro tento test
    console.log('DEBUG: Spouštím MongoMemoryServer.create()');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log('DEBUG: Připojuji mongoose na', uri);
    await mongoose.connect(uri);
    console.log('DEBUG: mongoose připojeno');
    // Načti všechny modely pro správnou registraci singletonů
    require('../models');
    AuditLog = getModel('AuditLog');
    ReportSetting = getModel('ReportSetting');
    User = getModel('User');
    const { createApp } = require('../server');
    app = createApp();
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
    // Vyčistit audit logy
    if (fs.existsSync(AUDIT_LOG_PATH)) fs.unlinkSync(AUDIT_LOG_PATH);
    await AuditLog.deleteMany({ performedBy: user._id });
    await ReportSetting.deleteMany({ createdBy: user._id });
    console.log('DEBUG: beforeAll hotovo');
  }, 30000);

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
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
