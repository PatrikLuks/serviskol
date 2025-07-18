
const reportUtils = require('../utils/reportUtils');
const fs = require('fs');

// Mock Campaign a User modely
const Campaign = { find: jest.fn() };
const User = { find: jest.fn() };
reportUtils.Campaign = Campaign;
reportUtils.User = User;

jest.mock('../utils/sendEmail', () => jest.fn());
const sendEmail = require('../utils/sendEmail');
reportUtils.sendEmail = sendEmail;


describe('reportUtils async/statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocků a znovu nastavit závislosti
    reportUtils.Campaign = Campaign;
    reportUtils.User = User;
  });

  describe('getWeeklyCtrStats', () => {
    it('should return 0 for all channels if no campaigns', async () => {
      Campaign.find.mockResolvedValueOnce([]);
      const ctrs = await reportUtils.getWeeklyCtrStats();
      expect(ctrs).toEqual({ 'in-app': 0, email: 0, push: 0, sms: 0 });
    });
    it('should calculate CTR for channels', async () => {
      Campaign.find.mockResolvedValueOnce([
        { variants: [ { channel: 'email', sentCount: 10, clickCount: 2 }, { channel: 'push', sentCount: 5, clickCount: 1 } ] }
      ]);
      const ctrs = await reportUtils.getWeeklyCtrStats();
      expect(ctrs.email).toBeCloseTo(20);
      expect(ctrs.push).toBeCloseTo(20);
    });
  });

  describe('sendWeeklyReport', () => {
    beforeEach(() => {
      User.find.mockResolvedValue([{ _id: 'admin1', email: 'admin@serviskol.cz', role: 'admin' }]);
      sendEmail.mockClear();
      sendEmail.mockResolvedValue();
      jest.spyOn(reportUtils, 'getWeeklyCtrStats').mockResolvedValue({ email: 10, push: 5, 'in-app': 0, sms: 0 });
      fs.writeFileSync('/tmp/audit.log', JSON.stringify({ timestamp: new Date(), action: 'Test', admin: 'admin@serviskol.cz' }) + '\n');
    });
    afterEach(() => {
      if (fs.existsSync('/tmp/audit.log')) fs.unlinkSync('/tmp/audit.log');
    });
    it('should send weekly report email to admins', async () => {
      await reportUtils.sendWeeklyReport();
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'admin@serviskol.cz', subject: expect.stringContaining('Týdenní report') }));
    });
    it('should not fail if audit log is missing', async () => {
      if (fs.existsSync('/tmp/audit.log')) fs.unlinkSync('/tmp/audit.log');
      await expect(reportUtils.sendWeeklyReport()).resolves.toBeUndefined();
    });
  });
});
