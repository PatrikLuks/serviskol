const { checkExportAlerts } = require('../middleware/auditLog');
const fs = require('fs');
const path = require('path');

jest.mock('../utils/notificationUtils', () => ({
  ...jest.requireActual('../utils/notificationUtils'),
  alertAdmins: jest.fn().mockResolvedValue(undefined)
}));

const logPath = path.join(__dirname, '../logs/audit.log');

describe('AuditLog export alerts', () => {
  beforeEach(() => {
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
  });

  it('should not trigger alert if exports <= 3', async () => {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 3; i++) {
      fs.appendFileSync(logPath, JSON.stringify({ timestamp: `${today}T12:00:0${i}Z`, action: 'Export dat' }) + '\n');
    }
    const { alertAdmins } = require('../utils/notificationUtils');
    await checkExportAlerts({ id: 'user1' });
    expect(alertAdmins).not.toHaveBeenCalled();
  });

  it('should trigger alert if exports > 3', async () => {
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 4; i++) {
      fs.appendFileSync(logPath, JSON.stringify({ timestamp: `${today}T12:00:0${i}Z`, action: 'Export dat' }) + '\n');
    }
    const { alertAdmins } = require('../utils/notificationUtils');
    await checkExportAlerts({ id: 'user1' });
    expect(alertAdmins).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.stringMatching(/ALERT/) }));
  });
});
