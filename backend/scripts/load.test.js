// Strategický test pro load testy (simulace zátěže)
const assert = require('assert');
describe('Load Test', () => {
  it('should handle high load', () => {
    const simulateLoad = (requests) => requests > 1000 ? 'LOAD_OK' : 'LOAD_LOW';
    const result = simulateLoad(1500);
    assert.strictEqual(result, 'LOAD_OK');
  });
  it('should report low load', () => {
    const simulateLoad = (requests) => requests > 1000 ? 'LOAD_OK' : 'LOAD_LOW';
    const result = simulateLoad(500);
    assert.strictEqual(result, 'LOAD_LOW');
  });
});
