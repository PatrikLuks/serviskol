// Automatizovaný bezpečnostní audit pro ServisKol
// Spouštěj pravidelně (např. v CI nebo CRONu)
// Kontroluje únik citlivých údajů, slabá místa v konfiguraci a závislosti

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /private/i,
  /jwt/i,
  /mongodb.*:.*@/i,
  /-----BEGIN (RSA|PRIVATE|OPENSSH|EC) PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/, // AWS key
  /AIza[0-9A-Za-z\-_]{35}/, // Google API key
  /"[0-9a-zA-Z]{32}"/, // generic 32-char string
];

const IGNORED_DIRS = ['node_modules', '.git', 'coverage', 'dist', 'logs', 'public'];

function scanDir(dir) {
  let findings = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        findings = findings.concat(scanDir(fullPath));
      }
    } else {
      const ext = path.extname(file);
      if (['.js', '.ts', '.json', '.env', '.md', ''].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of SENSITIVE_PATTERNS) {
          if (pattern.test(content)) {
            findings.push({ file: fullPath, pattern: pattern.toString() });
          }
        }
      }
    }
  }
  return findings;
}

function checkDependencies() {
  try {
    const audit = execSync('npm audit --json', { cwd: path.resolve(__dirname, '../') }).toString();
    const result = JSON.parse(audit);
    return result.metadata && result.metadata.vulnerabilities ? result.metadata.vulnerabilities : {};
  } catch (e) {
    return { error: 'Npm audit failed' };
  }
}

function main() {
  console.log('--- Bezpečnostní audit ServisKol ---');
  // 1. Kontrola úniku citlivých údajů
  const findings = scanDir(path.resolve(__dirname, '../..'));
  if (findings.length > 0) {
    console.warn('Nalezeny potenciální úniky citlivých údajů:');
    findings.forEach(f => console.warn(`Soubor: ${f.file}, Vzor: ${f.pattern}`));
  } else {
    console.log('Žádné úniky citlivých údajů nenalezeny.');
  }
  // 2. Kontrola závislostí
  const vuln = checkDependencies();
  if (vuln.error) {
    console.warn('Kontrola závislostí selhala:', vuln.error);
  } else {
    console.log('Zranitelnosti v závislostech:', vuln);
  }
}

if (require.main === module) {
  main();
}
