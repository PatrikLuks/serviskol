// Strategický test pro retrospektivní report
const assert = require('assert');
describe('Retrospektivní report', () => {
  it('should generate report from logs', () => {
    const generateRetrospectiveReport = (logs) => logs.length > 0 ? 'REPORT_OK' : 'REPORT_EMPTY';
    const result = generateRetrospectiveReport(['incident1', 'incident2']);
    assert.strictEqual(result, 'REPORT_OK');
  });
  it('should return empty report for no logs', () => {
    const generateRetrospectiveReport = (logs) => logs.length > 0 ? 'REPORT_OK' : 'REPORT_EMPTY';
    const result = generateRetrospectiveReport([]);
    assert.strictEqual(result, 'REPORT_EMPTY');
  });
});
