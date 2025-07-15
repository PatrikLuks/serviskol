const { auditLog, checkExportAlerts } = require('../middleware/auditLog');
const fs = require('fs');
const path = require('path');

jest.mock('../utils/notificationUtils', () => ({
  ...jest.requireActual('../utils/notificationUtils'),
  alertAdmins: jest.fn().mockResolvedValue(undefined)
}));

const logPath = '/tmp/audit.log';

describe('auditLog', () => {
  beforeEach(() => {
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
  });

  it('should write audit log entry', () => {
    auditLog('TestAction', { id: 'u1', email: 'e@e.cz' }, { foo: 'bar' });
    expect(fs.existsSync(logPath)).toBe(true);
    const log = fs.readFileSync(logPath, 'utf-8');
    expect(log).toMatch(/TestAction/);
    expect(log).toMatch(/e@e.cz/);
  });

  it('should not alert if <=3 exports', async () => {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 3; i++) {
      fs.appendFileSync(logPath, JSON.stringify({ timestamp: `${today}T12:00:0${i}Z`, action: 'Export dat' }) + '\n');
    }
    const { alertAdmins } = require('../utils/notificationUtils');
    await checkExportAlerts({ id: 'user1' });
    expect(alertAdmins).not.toHaveBeenCalled();
  });

  it('should alert if >3 exports', async () => {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 4; i++) {
      fs.appendFileSync(logPath, JSON.stringify({ timestamp: `${today}T12:00:0${i}Z`, action: 'Export dat' }) + '\n');
    }
    const { alertAdmins } = require('../utils/notificationUtils');
    await checkExportAlerts({ id: 'user1' });
    expect(alertAdmins).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/ALERT/) }));
  });
});
