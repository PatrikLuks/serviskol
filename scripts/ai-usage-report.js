// AI Usage Report – přehled využití AI skriptů a promptů v projektu
// Usage: node scripts/ai-usage-report.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getScriptUsage() {
  // Najdi všechny commity, kde byl spuštěn nebo změněn AI skript
  const scripts = ['generate-changelog-ai.js', 'ai-code-search.js'];
  let report = [];
  for (const script of scripts) {
    try {
      const log = execSync(`git log --pretty=format:'%ad|%an|%s' --date=short -- scripts/${script}`).toString();
      const lines = log.split('\n').filter(Boolean).map(l => l.split('|'));
      for (const [date, author, msg] of lines) {
        report.push({ type: 'script', script, date, author, msg });
      }
    } catch {}
  }
  return report;
}

function getPromptUsage() {
  // Najdi všechny změny v prompts/prompts.json
  try {
    const log = execSync("git log --pretty=format:'%ad|%an|%s' --date=short -- prompts/prompts.json").toString();
    return log.split('\n').filter(Boolean).map(l => {
      const [date, author, msg] = l.split('|');
      return { type: 'prompt', file: 'prompts/prompts.json', date, author, msg };
    });
  } catch {
    return [];
  }
}

function writeReport(data) {
  let out = `# AI Usage Report\n\nVygenerováno: ${new Date().toISOString()}\n\n## Využití AI skriptů\n`;
  const scripts = data.filter(d => d.type === 'script');
  if (scripts.length) {
    out += '\n| Datum | Autor | Skript | Commit message |\n|-------|-------|--------|---------------|\n';
    for (const r of scripts) {
      out += `| ${r.date} | ${r.author} | ${r.script} | ${r.msg} |\n`;
    }
  } else {
    out += '\nŽádné záznamy.\n';
  }
  out += '\n\n## Změny v prompty\n';
  const prompts = data.filter(d => d.type === 'prompt');
  if (prompts.length) {
    out += '\n| Datum | Autor | Soubor | Commit message |\n|-------|-------|--------|---------------|\n';
    for (const r of prompts) {
      out += `| ${r.date} | ${r.author} | ${r.file} | ${r.msg} |\n`;
    }
  } else {
    out += '\nŽádné záznamy.\n';
  }
  fs.writeFileSync('ai-usage-report.md', out);
  console.log('Report uložen do ai-usage-report.md');
}

const data = [...getScriptUsage(), ...getPromptUsage()];
writeReport(data);
