const reportUtils = require('../utils/reportUtils');

describe('reportUtils', () => {
  describe('getMonthlyCtrStats', () => {
    it('should return default CTR stats', async () => {
      const res = await reportUtils.getMonthlyCtrStats();
      expect(res).toEqual({ 'in-app': 0, email: 0, push: 0, sms: 0 });
    });
  });

  describe('getWeeklyCtrStats', () => {
    let origCampaign;
    beforeAll(() => {
      origCampaign = reportUtils.__get__ ? reportUtils.__get__('Campaign') : require('../models/Campaign');
      reportUtils.Campaign = {
        find: jest.fn()
      };
    });
    afterAll(() => {
      reportUtils.Campaign = origCampaign;
    });
    it('should return 0 CTRs if no campaigns', async () => {
      reportUtils.Campaign.find.mockResolvedValue([]);
      const res = await reportUtils.getWeeklyCtrStats();
      expect(res).toEqual({ 'in-app': 0, email: 0, push: 0, sms: 0 });
    });
    it('should calculate CTRs from campaign data', async () => {
      reportUtils.Campaign.find.mockResolvedValue([
        { variants: [
          { channel: 'email', sentCount: 10, clickCount: 2 },
          { channel: 'push', sentCount: 5, clickCount: 1 }
        ] }
      ]);
      const res = await reportUtils.getWeeklyCtrStats();
      expect(res.email).toBeCloseTo(20);
      expect(res.push).toBeCloseTo(20);
    });
  });

  describe('sendWeeklyReport', () => {
    let origUser, origSendEmail, origGetWeeklyCtrStats, origGetMonthlyCtrStats, fs, logPath;
    beforeAll(() => {
      origUser = reportUtils.__get__ ? reportUtils.__get__('User') : require('../models/User');
      origSendEmail = reportUtils.__get__ ? reportUtils.__get__('sendEmail') : require('../utils/sendEmail');
      origGetWeeklyCtrStats = reportUtils.getWeeklyCtrStats;
      origGetMonthlyCtrStats = reportUtils.getMonthlyCtrStats;
      reportUtils.User = { find: jest.fn() };
      reportUtils.getWeeklyCtrStats = jest.fn();
      reportUtils.getMonthlyCtrStats = jest.fn();
      reportUtils.sendEmail = jest.fn();
      fs = require('fs');
      logPath = '/tmp/audit.log';
    });
    afterAll(() => {
      reportUtils.User = origUser;
      reportUtils.getWeeklyCtrStats = origGetWeeklyCtrStats;
      reportUtils.getMonthlyCtrStats = origGetMonthlyCtrStats;
      reportUtils.sendEmail = origSendEmail;
    });
    beforeEach(() => {
      jest.clearAllMocks();
      if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
    });
    it('should send report to all admins', async () => {
      reportUtils.User.find.mockResolvedValue([{ email: 'admin@a.cz' }]);
      reportUtils.getWeeklyCtrStats.mockResolvedValue({ email: 10, push: 5, 'in-app': 0, sms: 0 });
      reportUtils.getMonthlyCtrStats.mockResolvedValue({ email: 20, push: 10, 'in-app': 0, sms: 0 });
      fs.writeFileSync(logPath, JSON.stringify({ timestamp: new Date().toISOString(), action: 'Export dat' }) + '\n');
      await reportUtils.sendWeeklyReport();
      expect(reportUtils.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'admin@a.cz',
        subject: 'Týdenní report ServisKol',
        text: expect.stringContaining('Počet akcí: 1')
      }));
    });
    it('should alert on too many failed logins', async () => {
      reportUtils.User.find.mockResolvedValue([{ email: 'admin@a.cz' }]);
      reportUtils.getWeeklyCtrStats.mockResolvedValue({ email: 10, push: 5, 'in-app': 0, sms: 0 });
      reportUtils.getMonthlyCtrStats.mockResolvedValue({ email: 20, push: 10, 'in-app': 0, sms: 0 });
      const now = new Date().toISOString();
      let log = '';
      for (let i = 0; i < 6; i++) log += JSON.stringify({ timestamp: now, action: 'Neúspěšné přihlášení' }) + '\n';
      fs.writeFileSync(logPath, log);
      await reportUtils.sendWeeklyReport();
      expect(reportUtils.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'admin@a.cz',
        subject: 'ALERT: Zvýšený počet neúspěšných přihlášení',
        text: expect.stringContaining('6 neúspěšných pokusů')
      }));
    });
    it('should not fail if audit log does not exist', async () => {
      reportUtils.User.find.mockResolvedValue([{ email: 'admin@a.cz' }]);
      reportUtils.getWeeklyCtrStats.mockResolvedValue({ email: 10, push: 5, 'in-app': 0, sms: 0 });
      reportUtils.getMonthlyCtrStats.mockResolvedValue({ email: 20, push: 10, 'in-app': 0, sms: 0 });
      if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
      await expect(reportUtils.sendWeeklyReport()).resolves.toBeUndefined();
    });
  });
  it('should generate CSV report', () => {
    const csv = reportUtils.generateCSVReport({
      stats: { avgCtr: 0.12, campaignCount: 5, topSegments: [{ region: 'Praha', ageGroup: '30-39', ctr: 0.15 }] },
      ctrTrendData: [{ date: '2025-07-01', ctr: 0.10 }, { date: '2025-07-02', ctr: 0.12 }],
      segmentHeatmapData: [{ region: 'Praha', ageGroup: '30-39', ctr: 0.15 }],
      summary: 'AI sumarizace test.'
    });
    expect(csv).toMatch(/Průměrné CTR/);
    expect(csv).toMatch(/AI sumarizace test/);
  });

  it('should handle empty stats and missing fields in CSV', () => {
    const csv = reportUtils.generateCSVReport({ stats: {}, ctrTrendData: [], segmentHeatmapData: [] });
    expect(csv).toMatch(/Statistika/);
  });

  it('should handle missing summary and empty topSegments in CSV', () => {
    const csv = reportUtils.generateCSVReport({ stats: { avgCtr: 0, campaignCount: 0, topSegments: [] }, ctrTrendData: [], segmentHeatmapData: [] });
    expect(csv).toMatch(/Průměrné CTR/);
  });

  it('should generate XLSX report', async () => {
    const buffer = await reportUtils.generateXLSXReport({
      stats: { avgCtr: 0.12, campaignCount: 5, topSegments: [{ region: 'Praha', ageGroup: '30-39', ctr: 0.15 }] },
      ctrTrendData: [{ date: '2025-07-01', ctr: 0.10 }, { date: '2025-07-02', ctr: 0.12 }],
      segmentHeatmapData: [{ region: 'Praha', ageGroup: '30-39', ctr: 0.15 }],
      summary: 'AI sumarizace test.'
    });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should handle empty stats and missing fields in XLSX', async () => {
    const buffer = await reportUtils.generateXLSXReport({ stats: {}, ctrTrendData: [], segmentHeatmapData: [] });
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should generate chart image', async () => {
    const buffer = await reportUtils.generateChartImage([
      { date: '2025-07-01', ctr: 0.10 },
      { date: '2025-07-02', ctr: 0.12 }
    ]);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it('should handle empty data in chart image', async () => {
    const buffer = await reportUtils.generateChartImage([]);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });

  // PDF generace testujeme pouze, že vrací buffer
  it('should generate PDF report', async () => {
    const pdfBuffer = await reportUtils.generatePDFReport({
      stats: { avgCtr: 0.12, campaignCount: 5, topSegments: [{ region: 'Praha', ageGroup: '30-39', ctr: 0.15 }] },
      summary: 'AI sumarizace test.'
    });
    expect(pdfBuffer).toBeInstanceOf(ArrayBuffer);
    expect(pdfBuffer.byteLength).toBeGreaterThan(0);
  });

  it('should handle missing summary and empty topSegments in PDF', async () => {
    const pdfBuffer = await reportUtils.generatePDFReport({ stats: { avgCtr: 0, campaignCount: 0, topSegments: [] } });
    expect(pdfBuffer).toBeInstanceOf(ArrayBuffer);
    expect(pdfBuffer.byteLength).toBeGreaterThan(0);
  });
});
