const adminService = require('../services/adminService');

jest.mock('../scripts/ai_change_impact_simulation', () => ({ main: jest.fn() }));
jest.mock('../scripts/ai_predict_process_weaknesses', () => ({ main: jest.fn() }));
jest.mock('../scripts/ai_sentiment_feedback_analysis', () => ({ main: jest.fn() }));
jest.mock('../scripts/ai_innovation_adoption_trends', () => ({ main: jest.fn() }));

describe('adminService', () => {
  const userWithPerm = (perm) => ({ permissions: [perm] });
  const userWithoutPerm = { permissions: [] };

  it('should generate change impact report with permission', async () => {
    const msg = await adminService.generateChangeImpactReport(userWithPerm('governance:changeimpact'));
    expect(msg).toMatch(/AI Change Impact Simulation Report/);
  });

  it('should throw on change impact report without permission', async () => {
    await expect(adminService.generateChangeImpactReport(userWithoutPerm)).rejects.toThrow('Nedostatečná oprávnění');
  });

  it('should generate process weakness report with permission', async () => {
    const msg = await adminService.generateProcessWeaknessReport(userWithPerm('governance:weakness'));
    expect(msg).toMatch(/AI Process Weakness Prediction Report/);
  });

  it('should throw on process weakness report without permission', async () => {
    await expect(adminService.generateProcessWeaknessReport(userWithoutPerm)).rejects.toThrow('Nedostatečná oprávnění');
  });

  it('should generate sentiment feedback report with permission', async () => {
    const msg = await adminService.generateSentimentFeedbackReport(userWithPerm('governance:sentiment'));
    expect(msg).toMatch(/AI Sentiment Feedback Analysis Report/);
  });

  it('should throw on sentiment feedback report without permission', async () => {
    await expect(adminService.generateSentimentFeedbackReport(userWithoutPerm)).rejects.toThrow('Nedostatečná oprávnění');
  });

  it('should generate innovation adoption report with permission', async () => {
    const msg = await adminService.generateInnovationAdoptionReport(userWithPerm('governance:adoption'));
    expect(msg).toMatch(/AI Innovation Adoption Trends Report/);
  });

  it('should throw on innovation adoption report without permission', async () => {
    await expect(adminService.generateInnovationAdoptionReport(userWithoutPerm)).rejects.toThrow('Nedostatečná oprávnění');
  });
});
