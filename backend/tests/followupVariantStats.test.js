describe('followupVariantStats util', () => {
jest.mock('../models/Notification', () => ({
  find: jest.fn(() => ({
    lean: jest.fn().mockResolvedValue([
      { user: '507f1f77bcf86cd799439011', type: 'followup', variant: 'A', stillIn: true },
      { user: '507f1f77bcf86cd799439012', type: 'followup', variant: 'B', stillIn: false }
    ])
  }))
}));

 jest.mock('../models/User', () => ({
   find: jest.fn(({ _id }) => ({
     lean: jest.fn().mockResolvedValue(
       Array.isArray(_id.$in)
         ? _id.$in.map((id, i) => ({ _id: id, aiSegment: i % 2 === 0 ? { loyaltyLevel: 'Gold' } : { loyaltyLevel: 'Silver' } }))
         : []
     )
   }))
 }));

const getVariantStats = require('../utils/followupVariantStats');

describe('followupVariantStats util', () => {
  it('should return empty stats for empty input', async () => {
    // Mock vrací data, ale pokud userIds je prázdné, dotaz by měl být prázdný
    const result = await getVariantStats({}, []);
    expect(result).toEqual({});
  });

  it('should handle segment and userIds', async () => {
    const segment = { loyaltyLevel: 'Gold' };
    const userIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
    const result = await getVariantStats(segment, userIds);
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('A');
    expect(result).toHaveProperty('B');
  });

  it('should handle missing variant (default)', async () => {
    jest.resetModules();
    jest.doMock('../models/Notification', () => ({
      find: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue([
          { user: 'u1', type: 'followup' } // no variant
        ])
      }))
    }));
    jest.doMock('../models/User', () => ({
      find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([{ _id: 'u1', aiSegment: { loyaltyLevel: 'Gold' } }]) }))
    }));
    const getVariantStats = require('../utils/followupVariantStats');
    const result = await getVariantStats({ loyaltyLevel: 'Gold' }, ['u1']);
    expect(result).toHaveProperty('default');
    expect(result.default.total).toBe(1);
  });

  it('should handle users not in segment', async () => {
    jest.resetModules();
    jest.doMock('../models/Notification', () => ({
      find: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue([
          { user: 'u2', type: 'followup', variant: 'A' }
        ])
      }))
    }));
    jest.doMock('../models/User', () => ({
      find: jest.fn(() => ({ lean: jest.fn().mockResolvedValue([{ _id: 'u2', aiSegment: { loyaltyLevel: 'Silver' } }]) }))
    }));
    const getVariantStats = require('../utils/followupVariantStats');
    const result = await getVariantStats({ loyaltyLevel: 'Gold' }, ['u2']);
    expect(result.A.stillIn).toBe(0);
    expect(result.A.left).toBe(1);
    expect(result.A.percentRetained).toBe(0);
    expect(result.A.percentLeft).toBe(100);
  });

  it('should handle error in User.find gracefully', async () => {
    jest.resetModules();
    jest.doMock('../models/Notification', () => ({
      find: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue([
          { user: 'u3', type: 'followup', variant: 'A' }
        ])
      }))
    }));
    jest.doMock('../models/User', () => ({
      find: jest.fn(() => { throw new Error('fail'); })
    }));
    const getVariantStats = require('../utils/followupVariantStats');
    await expect(getVariantStats({ loyaltyLevel: 'Gold' }, ['u3'])).rejects.toThrow('fail');
  });
});
});
