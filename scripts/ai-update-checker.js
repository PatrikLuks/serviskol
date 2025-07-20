// AI update checker – kontrola nových verzí AI rozšíření a skriptů
// Usage: node scripts/ai-update-checker.js

const { execSync } = require('child_process');
const https = require('https');

const EXTENSIONS = [
  'github.copilot',
  'github.copilot-chat',
  'codeium.codeium',
  'tabnine.tabnine-vscode',
  'continue.continue',
  'sourcegraph.cody-ai',
  'blackboxapp.blackboxagent'
];

function checkVSCodeExtension(ext) {
  try {
    const info = execSync(`code --list-extensions --show-versions | grep ${ext}`).toString().trim();
    const [, version] = info.split('@');
    return { ext, version };
  } catch (e) {
    console.error(e);
    return { ext, version: 'nenainstalováno' };
  }
}

function getMarketplaceVersion(ext, cb) {
  const url = `https://marketplace.visualstudio.com/items?itemName=${ext}`;
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const m = data.match(/"version":"([^"]+)"/);
      cb(m ? m[1] : 'neznámá');
    });
  }).on('error', () => cb('chyba'));
}

(async () => {
  console.log('AI update checker – VS Code extensions');
  for (const ext of EXTENSIONS) {
    const local = checkVSCodeExtension(ext);
    await new Promise(resolve => {
      getMarketplaceVersion(ext, remote => {
        console.log(`- ${ext}: lokální verze ${local.version}, poslední verze ${remote}`);
        if (local.version !== 'nenainstalováno' && local.version !== remote) {
          console.log(`  → Doporučeno aktualizovat na ${remote}`);
        }
        resolve();
      });
    });
  }
  // Kontrola AI skriptů (verze v package.json nebo git log)
  // Lze rozšířit podle potřeby
})();
