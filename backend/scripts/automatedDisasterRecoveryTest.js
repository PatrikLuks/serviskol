// Automatizovaný disaster recovery test – ověření obnovy ze zálohy a AI sumarizace výsledku
// Výstup: reports/disaster_recovery_test_YYYY-MM-DD.txt

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { execSync } = require('child_process');
const { Configuration, OpenAIApi } = require('openai');

const BACKUP_DIR = path.resolve(__dirname, '../backups');
const RESTORE_SCRIPT = path.resolve(__dirname, './restore_mongo.sh');
const OUT_PATH = path.resolve(__dirname, `../reports/disaster_recovery_test_${dayjs().format('YYYY-MM-DD')}.txt`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestBackup() {
  if (!fs.existsSync(BACKUP_DIR)) return null;
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.gz') || f.endsWith('.zip'));
  if (files.length === 0) return null;
  return files.map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtime })).sort((a, b) => b.t - a.t)[0].f;
}

async function aiSummarize(log) {
  if (!OPENAI_API_KEY) return 'AI sumarizace není dostupná (chybí OPENAI_API_KEY).';
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Zhodnoť následující výsledek disaster recovery testu (obnova MongoDB ze zálohy):\n\n${log}\n\nVytvoř stručné shrnutí, doporučení a případná rizika. Odpověz česky, v markdown.`;
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600
  });
  return aiResp.data.choices[0].message.content;
}

async function main() {
  const backup = getLatestBackup();
  let log = `=== DISASTER RECOVERY TEST (${dayjs().format('YYYY-MM-DD')}) ===\n`;
  if (!backup) {
    log += 'Žádná záloha nenalezena. Test nelze provést.';
    fs.writeFileSync(OUT_PATH, log);
    return;
  }
  log += `Použitá záloha: ${backup}\n`;
  try {
    const restoreCmd = `${RESTORE_SCRIPT} ${path.join(BACKUP_DIR, backup)}`;
    const output = execSync(restoreCmd, { encoding: 'utf8', stdio: 'pipe' });
    log += 'Obnova proběhla úspěšně.\nVýstup skriptu:\n' + output;
  } catch (e) {
    log += 'Obnova selhala!\nChyba:\n' + e.message;
  }
  // AI sumarizace
  const aiSummary = await aiSummarize(log);
  log += '\n--- AI sumarizace ---\n' + aiSummary;
  fs.writeFileSync(OUT_PATH, log);
  console.log('Disaster recovery test dokončen:', OUT_PATH);
}

if (require.main === module) {
  main();
}
