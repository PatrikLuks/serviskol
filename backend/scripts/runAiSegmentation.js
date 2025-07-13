// Spustí AI segmentaci uživatelů (periodicky, např. 1x denně)
const { exec } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'aiSegmentUsers.js');

exec(`node ${script}`, (err, stdout, stderr) => {
  if (err) {
    console.error('Chyba při segmentaci:', stderr);
    process.exit(1);
  }
  console.log(stdout);
});
