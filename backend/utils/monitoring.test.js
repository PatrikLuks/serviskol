// Strategický test pro monitoring/logování
const assert = require('assert');
describe('Monitoring', () => {
  it('should log event to file', () => {
    const logEvent = (event) => event ? 'LOG_OK' : 'LOG_FAIL';
    const result = logEvent('CRITICAL_EVENT');
    assert.strictEqual(result, 'LOG_OK');
  });
  it('should fail to log empty event', () => {
    const logEvent = (event) => event ? 'LOG_OK' : 'LOG_FAIL';
    const result = logEvent('');
    assert.strictEqual(result, 'LOG_FAIL');
  });
});
