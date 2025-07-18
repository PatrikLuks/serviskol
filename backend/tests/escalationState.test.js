const { setLastEscalation, getLastEscalation } = require('../utils/escalationState');

describe('escalationState util', () => {
  beforeEach(() => {
    setLastEscalation(null);
  });

  it('should set and get last escalation value', () => {
    const escalation = { level: 'critical', message: 'Incident' };
    setLastEscalation(escalation);
    const result = getLastEscalation();
    expect(result.level).toBe('critical');
    expect(result.message).toBe('Incident');
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should return object with timestamp if set to null', () => {
    setLastEscalation(null);
    const result = getLastEscalation();
    expect(result).toHaveProperty('timestamp');
  });
});
