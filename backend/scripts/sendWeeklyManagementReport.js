// Skript pro periodický management reporting exportů
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const statsPath = path.join(__dirname, '../reports/export-stats.json');
const reportPath = path.join(__dirname, '../reports/export-failures-report.txt');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});
const managementEmails = (process.env.MANAGEMENT_EMAILS || process.env.MANAGEMENT_EMAIL || 'management@example.com')
  .split(',').map(e => e.trim()).filter(Boolean);

function sendManagementReport(subject, text) {
  managementEmails.forEach(email => {
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@example.com',
      to: email,
      subject,
      text
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`Chyba při odesílání reportu na ${email}:`, error);
      } else {
        console.log(`Report odeslán na ${email}:`, info.response);
      }
    });
  });
}

function main() {
  // AI predikce budoucích rizik a doporučení pro prevenci
  let futureRiskPrediction = '';
  let preventionRecommendation = '';
  if (fs.existsSync(statsPath)) {
    const statsObj = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    if (statsObj.daily) {
      const days = Object.keys(statsObj.daily);
      const fails = days.map(d => statsObj.daily[d].fail);
      const avg = fails.length ? fails.reduce((a,b) => a+b,0)/fails.length : 0;
      const lastFail = fails[fails.length-1] || 0;
      if (lastFail > avg && lastFail > 0) {
        futureRiskPrediction = 'Predikce budoucích rizik: Riziko dalšího selhání je zvýšené. Doporučujeme preventivní kontrolu systému, monitoring síťových služeb a pravidelnou revizi AWS credentials.';
        preventionRecommendation = 'Doporučení pro prevenci: Nastavte automatizované testy exportu, pravidelně kontrolujte logy, zaveďte alerty pro opakované chyby, a integrujte export monitoring do incident management systému.';
      } else {
        futureRiskPrediction = 'Predikce budoucích rizik: Riziko dalšího selhání je nízké, ale doporučujeme pokračovat v pravidelném monitoringu a revizi systému.';
        preventionRecommendation = 'Doporučení pro prevenci: Udržujte monitoring, pravidelně aktualizujte dokumentaci a testujte obnovu exportních procesů.';
      }
    }
  }
  // Integrace s incident management systémem
  let incidentIntegration = '';
  incidentIntegration = 'Integrace s incident management systémem: Doporučujeme propojit export monitoring s ServiceNow, Jira nebo jiným systémem pro automatické vytváření incidentů při kritických selháních.';
  let previousWeekFails = null;
  let failChange = '';
  // Najdi předchozí týden v export.log
  if (fs.existsSync(statsPath) && fs.existsSync(path.join(__dirname, '../reports/export.log'))) {
    const statsObj = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    const logLines = fs.readFileSync(path.join(__dirname, '../reports/export.log'), 'utf-8').split('\n').filter(Boolean);
    const today = new Date();
    let prevWeekFails = 0;
    logLines.forEach(line => {
      const dateStr = line.slice(0, 10);
      const d = new Date(dateStr);
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      if (diff > 7 && diff <= 14 && line.includes('Chyba při uploadu')) {
        prevWeekFails++;
      }
    });
    previousWeekFails = prevWeekFails;
    if (typeof statsObj.recentFails === 'number') {
      const change = statsObj.recentFails - previousWeekFails;
      if (change > 0) failChange = `Počet selhání exportů vzrostl o ${change} oproti předchozímu týdnu.`;
      else if (change < 0) failChange = `Počet selhání exportů klesl o ${-change} oproti předchozímu týdnu.`;
      else failChange = 'Počet selhání exportů je stejný jako minulý týden.';
    }
  }
  let topFailWeekday = '';
  if (fs.existsSync(statsPath)) {
    const statsObj = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    if (statsObj.daily) {
      const weekdayCounts = [0,0,0,0,0,0,0];
      Object.entries(statsObj.daily).forEach(([day, val]) => {
        const d = new Date(day);
        const weekday = d.getDay();
        weekdayCounts[weekday] += val.fail;
      });
      const maxCount = Math.max(...weekdayCounts);
      if (maxCount > 0) {
        const topDay = ['Ne','Po','Út','St','Čt','Pá','So'][weekdayCounts.indexOf(maxCount)];
        topFailWeekday = `Nejčastější den selhání: ${topDay} (${maxCount} selhání)\n`;
      }
    }
  }
  let otherErrors = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    const errorLines = report.split('\n').filter(l => l.includes('Chyba při uploadu'));
    const otherLines = errorLines.filter(l => !l.includes('ECONNREFUSED') && !l.includes('CredentialsError'));
    if (otherLines.length) {
      otherErrors = 'Chyby Other:\n' + otherLines.map(l => `- ${l}`).join('\n') + '\n';
    }
  }
  let econnrefusedErrors = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    const econnLines = report.split('\n').filter(l => l.includes('ECONNREFUSED'));
    if (econnLines.length) {
      econnrefusedErrors = 'Chyby ECONNREFUSED:\n' + econnLines.map(l => `- ${l}`).join('\n') + '\n';
    }
  }
  let awsCredentialsErrors = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    const awsLines = report.split('\n').filter(l => l.includes('CredentialsError'));
    if (awsLines.length) {
      awsCredentialsErrors = 'Chyby s AWS credentials:\n' + awsLines.map(l => `- ${l}`).join('\n') + '\n';
    }
  }
  let repeatedDayTypeErrors = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    // Hledej sekci 'Detekovány opakované typy chyb ve stejný den v týdnu:'
    const repeatedStart = report.indexOf('Detekovány opakované typy chyb ve stejný den v týdnu:');
    if (repeatedStart !== -1) {
      const repeatedEnd = report.indexOf('Doporučujeme detailní analýzu infrastruktury', repeatedStart);
      repeatedDayTypeErrors = report.slice(repeatedStart, repeatedEnd !== -1 ? repeatedEnd : undefined) + '\n';
    }
  }
  let topFailDays = '';
  if (fs.existsSync(statsPath)) {
    const statsObj = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    if (statsObj.daily) {
      const failDays = Object.entries(statsObj.daily)
        .map(([day, val]) => ({ day, fail: val.fail }))
        .filter(d => d.fail > 0)
        .sort((a,b) => b.fail - a.fail)
        .slice(0,2);
      if (failDays.length) {
        topFailDays = 'Dny s nejvyšším počtem selhání:\n' + failDays.map(d => `- ${d.day}: ${d.fail} selhání`).join('\n') + '\n';
      }
    }
  }
  let topErrorTypes = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    // Najdi typy chyb v selháních
    const errorLines = report.split('\n').filter(l => l.includes('Chyba při uploadu'));
    const typeCounts = {};
    errorLines.forEach(line => {
      const match = line.match(/Chyba při uploadu: ([^\s]+)/);
      if (match) {
        const type = match[1];
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
    const sortedTypes = Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).slice(0,3);
    if (sortedTypes.length) {
      topErrorTypes = 'Nejčastější typy chyb (top 3):\n' + sortedTypes.map(([type, count]) => `- ${type}: ${count}x`).join('\n') + '\n';
    }
  }
  let escalationHistory = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    // Hledej řádky s 'Eskalace:' nebo 'Kritický alert' v posledních 5 dnech
    const lines = report.split('\n').filter(l => l.includes('Eskalace') || l.includes('Kritický alert'));
    if (lines.length) {
      escalationHistory = 'Historie eskalací (posledních 5):\n' + lines.slice(-5).join('\n') + '\n';
    }
  }
  let stats = '';
  let aiSummary = '';
  let trendGraph = '';
  let escalationInfo = '';
  if (fs.existsSync(statsPath)) {
    const statsObj = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    stats = JSON.stringify(statsObj, null, 2);
    // ASCII graf trendu selhání a úspěšných exportů
    if (statsObj.daily) {
      const days = Object.keys(statsObj.daily);
      const fails = days.map(d => statsObj.daily[d].fail);
      const success = days.map(d => statsObj.daily[d].success);
      trendGraph = '\nTrend exportů (poslední dny):\n';
      days.forEach((day, i) => {
        const barSuccess = '█'.repeat(success[i]);
        const barFail = '░'.repeat(fails[i]);
        trendGraph += `${day}: Úspěch ${barSuccess} (${success[i]})  Selhání ${barFail} (${fails[i]})\n`;
      });
    }
    // Eskalace
    if (statsObj.escalation && statsObj.escalation.needed) {
      escalationInfo = `Eskalace aktivována: ${statsObj.escalation.reason || 'Kritický alert byl eskalován (SMS/email)'}\n`;
    }
  }
  let aiPrediction = '';
  let aiActions = '';
  if (fs.existsSync(reportPath)) {
    const report = fs.readFileSync(reportPath, 'utf-8');
    const aiStart = report.indexOf('AI shrnutí a doporučení:');
    if (aiStart !== -1) {
      aiSummary = report.slice(aiStart);
      // Extrahuj AI predikci trendu
      const predStart = aiSummary.indexOf('Predikce:');
      if (predStart !== -1) {
        const predEnd = aiSummary.indexOf('\n', predStart + 1);
        aiPrediction = aiSummary.slice(predStart, predEnd !== -1 ? predEnd : undefined);
      }
      // Extrahuj doporučené akce
      const actionStart = aiSummary.indexOf('Doporučujeme');
      if (actionStart !== -1) {
        const actionEnd = aiSummary.indexOf('\n', actionStart + 1);
        aiActions = aiSummary.slice(actionStart, actionEnd !== -1 ? actionEnd : undefined);
      }
    }
  }
  const subject = 'Týdenní management report – exporty Serviskol';
  const text = `Shrnutí exportních statistik za poslední týden:\n\n${stats}\n${trendGraph}\n${escalationInfo}${aiPrediction}\n${failChange}\n${futureRiskPrediction}\n${preventionRecommendation}\n${incidentIntegration}\n${escalationHistory}${topErrorTypes}${topFailDays}${repeatedDayTypeErrors}${awsCredentialsErrors}${econnrefusedErrors}${otherErrors}${topFailWeekday}\nDoporučené akce:\n${aiActions}\n\n${aiSummary}`;
  sendManagementReport(subject, text);
}

main();
