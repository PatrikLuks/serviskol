const buildSegmentQuery = require('../utils/segmentQueryBuilder');

describe('segmentQueryBuilder util', () => {
  it('should return empty object for empty input', () => {
    expect(buildSegmentQuery()).toEqual({});
    expect(buildSegmentQuery({})).toEqual({});
  });

  it('should build query for email, role, region', () => {
    const q = buildSegmentQuery({ email: 'a@b.cz', role: 'client', region: 'Praha' });
    expect(q).toEqual({ email: 'a@b.cz', role: 'client', region: 'Praha' });
  });

  it('should build query for loyaltyLevel and aiSegment', () => {
    const q = buildSegmentQuery({ loyaltyLevel: 'Gold', aiSegment: 'riziko_odchodu' });
    expect(q).toEqual({ loyaltyLevel: 'Gold', aiSegment: 'riziko_odchodu' });
  });

  it('should build query for age, ageMin, ageMax', () => {
    const q = buildSegmentQuery({ age: 30, ageMin: 18, ageMax: 40 });
    expect(q.age).toEqual({ $gte: 18, $lte: 40 });
  });

  it('should build query for lastLoginSince', () => {
    const date = '2025-01-01T00:00:00Z';
    const q = buildSegmentQuery({ lastLoginSince: date });
    expect(q.lastLogin).toEqual({ $gte: new Date(date) });
  });

  it('should build query for engagementMin', () => {
    const q = buildSegmentQuery({ engagementMin: 10 });
    expect(q.engagementScore).toEqual({ $gte: 10 });
  });

  it('should build query for status', () => {
    const q = buildSegmentQuery({ status: 'active' });
    expect(q.status).toBe('active');
  });

  it('should not include unknown fields', () => {
    const q = buildSegmentQuery({ unknown: 123 });
    expect(q.unknown).toBeUndefined();
  });
});
