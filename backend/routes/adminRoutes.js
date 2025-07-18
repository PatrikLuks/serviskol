const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { auth } = require('../middleware/auth');

// Simulace dopadů změn v procesech (change impact analysis)
router.post('/change-impact-simulation', auth, async (req, res) => {
  try {
    const message = await adminService.generateChangeImpactReport(req.user);
    res.json({ ok: true, message });
  } catch (e) {
    if (e.message === 'Nedostatečná oprávnění') {
      return res.status(403).json({ error: e.message });
    }
    res.status(500).json({ error: 'Chyba při generování change impact simulation reportu', detail: e.message });
  }
});
// Predikce slabých míst v procesech na základě audit logů, incidentů a feedbacku
router.post('/predict-process-weaknesses', auth, async (req, res) => {
  try {
    const message = await adminService.generateProcessWeaknessReport(req.user);
    res.json({ ok: true, message });
  } catch (e) {
    if (e.message === 'Nedostatečná oprávnění') {
      return res.status(403).json({ error: e.message });
    }
    res.status(500).json({ error: 'Chyba při generování weakness prediction reportu', detail: e.message });
  }
});
// Sentiment analýza uživatelské zpětné vazby a incidentů
router.post('/sentiment-feedback-analysis', auth, async (req, res) => {
  try {
    const message = await adminService.generateSentimentFeedbackReport(req.user);
    res.json({ ok: true, message });
  } catch (e) {
    if (e.message === 'Nedostatečná oprávnění') {
      return res.status(403).json({ error: e.message });
    }
    res.status(500).json({ error: 'Chyba při generování sentiment analysis reportu', detail: e.message });
  }
});
// Report trendů v adopci inovací a automatizací
router.post('/innovation-adoption-trends', auth, async (req, res) => {
  try {
    const message = await adminService.generateInnovationAdoptionReport(req.user);
    res.json({ ok: true, message });
  } catch (e) {
    if (e.message === 'Nedostatečná oprávnění') {
      return res.status(403).json({ error: e.message });
    }
    res.status(500).json({ error: 'Chyba při generování adoption trends reportu', detail: e.message });
  }
});
// Compliance report z týmového knowledge base
router.post('/team-knowledge-base-compliance-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:compliance')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const compliance = require('../scripts/ai_team_knowledge_base_compliance_report');
    await compliance.main();
    res.json({ ok: true, message: 'Compliance report z týmového knowledge base byl vygenerován.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování compliance reportu', detail: e.message });
  }
});
// Export týmového knowledge base do SIEM/SOC
router.post('/team-knowledge-base-siem-export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:siem')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const siem = require('../scripts/ai_team_knowledge_base_siem_export');
    await siem.exportToSIEM();
    res.json({ ok: true, message: 'Týmový knowledge base byl exportován do SIEM/SOC.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu knowledge base do SIEM/SOC', detail: e.message });
  }
});
// Export týmového knowledge base e-mailem vedení/týmu
router.post('/team-knowledge-base-email', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:email')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const emailer = require('../scripts/ai_team_knowledge_base_email');
    await emailer.emailKnowledgeBase();
    res.json({ ok: true, message: 'Týmový knowledge base byl odeslán e-mailem vedení/týmu.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při odesílání knowledge base e-mailem', detail: e.message });
  }
});
// Archivace týmového knowledge base do S3 bucketu
router.post('/team-knowledge-base-archive', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:archive')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const archiver = require('../scripts/ai_team_knowledge_base_archive');
    await archiver.archiveKnowledgeBase();
    res.json({ ok: true, message: 'Týmový knowledge base byl archivován do S3 bucketu.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při archivaci knowledge base', detail: e.message });
  }
});
// Export týmového knowledge base do PDF/Markdown
router.post('/team-knowledge-base-export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const exporter = require('../scripts/ai_team_knowledge_base_export');
    await exporter.exportKnowledgeBase();
    res.json({ ok: true, message: 'Týmový knowledge base byl exportován do PDF/Markdown.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu knowledge base', detail: e.message });
  }
});
// AI kontinuální improvement roadmapa pro tým
router.post('/continuous-improvement-roadmap', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:improvement')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const roadmap = require('../scripts/ai_continuous_improvement_roadmap');
    await roadmap.main();
    res.json({ ok: true, message: 'AI Continuous Improvement Roadmap byla úspěšně vygenerována. Výsledek je uložen v reports/ai_continuous_improvement_roadmap-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování improvement roadmapy', detail: e.message });
  }
});
// AI executive summary pro vedení
router.post('/executive-summary-generator', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:executive')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const exec = require('../scripts/ai_executive_summary_generator');
    await exec.main();
    res.json({ ok: true, message: 'AI Executive Summary Generator byl úspěšně proveden. Výsledek je uložen v reports/ai_executive_summary_generator-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování executive summary', detail: e.message });
  }
});
// AI kvartální retrospektiva & lessons learned pro tým
router.post('/retrospective-generator', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:retrospective')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const retro = require('../scripts/ai_retrospective_generator');
    await retro.main();
    res.json({ ok: true, message: 'AI Retrospective Generator byl úspěšně proveden. Výsledek je uložen v reports/ai_retrospective_generator-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování retrospektivy', detail: e.message });
  }
});
// AI generátor micro-workshopů pro tým
router.post('/micro-workshop-generator', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:workshop')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const workshop = require('../scripts/ai_micro_workshop_generator');
    await workshop.main();
    res.json({ ok: true, message: 'AI Micro-Workshop Generator byl úspěšně proveden. Výsledek je uložen v reports/ai_micro_workshop_generator-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování micro-workshopů', detail: e.message });
  }
});
// AI personalizovaný mentoringový plán pro tým
router.post('/personalized-mentoring-plan', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:mentor')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const mentor = require('../scripts/ai_personalized_mentoring_plan');
    await mentor.main();
    res.json({ ok: true, message: 'AI Personalized Mentoring Plan byl úspěšně vygenerován. Výsledek je uložen v reports/ai_personalized_mentoring_plan-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování mentoringového plánu', detail: e.message });
  }
});
// AI gamifikace sdílení znalostí v týmu
router.post('/gamified-knowledge-sharing', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:gamify')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const gamify = require('../scripts/ai_gamified_knowledge_sharing');
    await gamify.main();
    res.json({ ok: true, message: 'AI Gamified Knowledge Sharing byl úspěšně proveden. Výsledek je uložen v reports/ai_gamified_knowledge_sharing-<datum>.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při gamifikaci sdílení znalostí', detail: e.message });
  }
});
// AI healthcheck & anomaly detection na backend API
router.post('/healthcheck', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:healthcheck')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const healthcheck = require('../scripts/ai_healthcheck');
    await healthcheck.main();
    res.json({ ok: true, message: 'AI Healthcheck byl úspěšně proveden. Výsledek je uložen v reports/ai-healthcheck-report.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při AI healthchecku', detail: e.message });
  }
});
// What-if simulace dopadů neřešených slabin/backlogu
router.post('/whatif-simulation', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:simulate')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const whatif = require('../scripts/ai_whatif_simulation');
    await whatif.main();
    res.json({ ok: true, message: 'What-if simulace byla úspěšně provedena. Výsledek je uložen v reports/ai_whatif_simulation.md.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při what-if simulaci', detail: e.message });
  }
});
// Eskalace nerealizovaných AI doporučení (Notion backlog) vedení
router.post('/escalate-unrealized-recommendations', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:escalate')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const escalate = require('../scripts/ai_escalate_unrealized_recommendations');
    await escalate.main();
    res.json({ ok: true, message: 'Eskalace nerealizovaných doporučení proběhla.' });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při eskalaci nerealizovaných doporučení', detail: e.message });
  }
});
// AI-driven onboarding executive summary
router.get('/onboarding-executive-summary', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateExecutiveSummary } = require('../scripts/ai_onboarding_executive_summary');
    const summary = generateExecutiveSummary();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(summary);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování executive summary', detail: e.message });
  }
});
// AI-driven onboarding compliance check
router.get('/onboarding-compliance-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getComplianceReport } = require('../scripts/ai_onboarding_compliance_check');
    const report = getComplianceReport();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání compliance reportu', detail: e.message });
  }
});
// AI-driven onboarding audit log
router.get('/onboarding-audit-log', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getAuditLog } = require('../scripts/ai_onboarding_audit_log');
    const log = getAuditLog();
    res.json(log);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání audit logu', detail: e.message });
  }
});
// AI-driven onboarding knowledge base
router.get('/onboarding-knowledge-base', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateKnowledgeBase } = require('../scripts/ai_onboarding_knowledge_base');
    const kb = generateKnowledgeBase();
    res.json(kb);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování knowledge base', detail: e.message });
  }
});
// AI-driven onboarding continuous improvement: roadmapa inovací
router.get('/onboarding-improvement-roadmap', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateRoadmap } = require('../scripts/ai_onboarding_improvement_roadmap');
    const roadmap = generateRoadmap();
    res.json(roadmap);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování roadmapy inovací', detail: e.message });
  }
});
// AI-driven onboarding incident management: detekce, reporting, řešení
router.get('/onboarding-incidents', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { detectIncidents } = require('../scripts/ai_onboarding_incident_management');
    const report = detectIncidents();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání incident reportu', detail: e.message });
  }
});
// AI healthcheck onboarding procesu: stav, rizika, urgentní doporučení
router.get('/onboarding-healthcheck', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getHealthcheck } = require('../scripts/ai_onboarding_healthcheck');
    const health = getHealthcheck();
    res.json(health);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání healthchecku', detail: e.message });
  }
});
// Onboarding gamifikace: body, žebříček, motivace
router.get('/onboarding-gamification', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getGamificationStatus } = require('../scripts/ai_onboarding_gamification');
    const status = getGamificationStatus(user);
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při získávání gamifikace', detail: e.message });
  }
});
// AI-driven onboarding mentoring: přiřazení mentora, doporučení, pokrok
router.get('/onboarding-mentoring', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { assignMentor } = require('../scripts/ai_onboarding_mentoring');
    const mentoring = assignMentor(user);
    res.json(mentoring);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování mentoring informací', detail: e.message });
  }
});
// Personalizovaná onboarding doporučení pro uživatele
router.get('/onboarding-personal-recommendations', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generatePersonalRecommendations } = require('../scripts/ai_onboarding_personal_recommendations');
    const status = await generatePersonalRecommendations(user);
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování personalizovaných doporučení', detail: e.message });
  }
});
// AI generování best practices pro onboarding proces
router.get('/onboarding-best-practices', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateBestPractices } = require('../scripts/ai_onboarding_best_practices');
    const practices = generateBestPractices();
    res.json(practices);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování best practices', detail: e.message });
  }
});
// AI predikce budoucích slabin onboarding procesu
router.get('/onboarding-predict-weaknesses', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { predictWeaknesses } = require('../scripts/ai_onboarding_predict_weaknesses');
    const prediction = predictWeaknesses();
    res.json(prediction);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při AI predikci slabin', detail: e.message });
  }
});
// Reporting stavu plnění akčních kroků z retrospektiv
router.get('/onboarding-actions-status', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getActionsStatus } = require('../scripts/ai_onboarding_actions_status');
    const status = getActionsStatus();
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při reportingu stavu akčních kroků', detail: e.message });
  }
});
// Onboarding retrospektiva (AI shrnutí a akční kroky)
router.get('/onboarding-retrospective', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateRetrospective } = require('../scripts/ai_onboarding_retrospective');
    const summary = generateRetrospective();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(summary);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování retrospektivy', detail: e.message });
  }
});
// Archivace onboarding reportu do S3 a rozeslání e-mailem
router.post('/onboarding-report-archive', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { archiveReport } = require('../scripts/archive_onboarding_report');
    const result = archiveReport();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při archivaci onboarding reportu', detail: e.message });
  }
});
// Export onboarding reportu do Markdown
router.get('/onboarding-report-export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { exportMarkdown } = require('../scripts/export_onboarding_report');
    const filePath = exportMarkdown();
    res.download(filePath, 'onboarding_report-latest.md');
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu onboarding reportu', detail: e.message });
  }
});
// Reporting dopadu onboarding zlepšení
router.get('/onboarding-impact', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { analyzeImpact } = require('../scripts/ai_onboarding_impact');
    const report = analyzeImpact();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při analýze dopadu onboardingu', detail: e.message });
  }
});

// AI export data report: reporting nad exporty dat
router.get('/export-data-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_export_data_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_export_data_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování export data reportu', detail: e.message });
  }
});

// AI rights change report: reporting nad změnami práv
router.get('/rights-change-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_rights_change_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_rights_change_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování rights change reportu', detail: e.message });
  }
});

// AI action tracking report: reporting plnění akčních kroků
router.get('/action-tracking-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_action_tracking_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_action_tracking_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování action tracking reportu', detail: e.message });
  }
});

// AI disaster recovery report: reporting stavu obnovy záloh a resilience
router.get('/disaster-recovery-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_disaster_recovery_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_disaster_recovery_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování disaster recovery reportu', detail: e.message });
  }
});

// AI lessons learned report: shrnutí lessons learned, trendů a doporučení
router.get('/lessons-learned-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_lessons_learned_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_lessons_learned_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování lessons learned reportu', detail: e.message });
  }
});

// AI best practices report: shrnutí best practices, inovací a doporučení
router.get('/best-practices-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_best_practices_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_best_practices_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování best practices reportu', detail: e.message });
  }
});

// AI innovation trends report: shrnutí trendů v inovacích, AI, bezpečnosti a governance
router.get('/innovation-trends-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_innovation_trends_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_innovation_trends_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování innovation trends reportu', detail: e.message });
  }
});

// AI team knowledge base report: shrnutí znalostí, best practices, lessons learned a inovací pro tým
router.get('/team-knowledge-base-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { main } = require('../scripts/ai_team_knowledge_base_report');
    await main();
    const fs = require('fs');
    const path = require('path');
    const REPORTS_DIR = path.join(__dirname, '../reports');
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_team_knowledge_base_report-')).sort().reverse();
    const report = files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8') : 'Report není dostupný.';
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování team knowledge base reportu', detail: e.message });
  }
});
// Automatická eskalace slabin onboarding procesu
router.post('/onboarding-escalate', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:escalate')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { escalate } = require('../scripts/ai_onboarding_escalate');
    const result = escalate();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při eskalaci slabin onboardingu', detail: e.message });
  }
});
// Reporting trendů a doporučení z onboarding procesu
router.get('/onboarding-trends', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { analyzeTrends } = require('../scripts/ai_onboarding_trends');
    const report = analyzeTrends();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při analýze onboarding trendů', detail: e.message });
  }
});
// Příjem onboarding zpětné vazby od uživatele
router.post('/onboarding-feedback', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:feedback')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const feedback = req.body.feedback;
    if (!feedback || typeof feedback !== 'string') {
      return res.status(400).json({ error: 'Chybí text zpětné vazby' });
    }
    // Uložení feedbacku do souboru (pro jednoduchost)
    const fs = require('fs');
    const path = require('path');
    const feedbackPath = path.join(__dirname, '../logs/onboarding_feedback.log');
    fs.appendFileSync(feedbackPath, `[${new Date().toISOString()}] ${user.email || user.id}: ${feedback}\n`);
    // Spuštění AI analýzy feedbacku (asynchronně)
    require('../scripts/ai_onboarding_feedback_analyze').analyze(feedback, user);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při ukládání onboarding feedbacku', detail: e.message });
  }
});
// Generování personalizovaného onboarding checklistu
router.get('/onboarding-checklist', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('onboarding:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { generateChecklist } = require('../scripts/ai_onboarding_checklist');
    const checklist = await generateChecklist(user);
    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování onboarding checklistu', detail: e.message });
  }
});
// AI predikce dopadu nerealizovaných doporučení (Notion úkolů)
router.get('/unrealized-impact', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const predict = require('../scripts/ai_predict_unrealized_impact');
    const impact = await predict.main();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(impact);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při AI predikci dopadu nerealizovaných doporučení', detail: e.message });
  }
});
// Trendová analýza Notion úkolů (AI recommendations/lessons learned)
router.get('/notion-tasks-trends', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const trends = require('../scripts/notion_tasks_trends');
    const data = await trends.main();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání trendů Notion úkolů', detail: e.message });
  }
});
// Reporting stavu Notion úkolů (AI recommendations/lessons learned)
router.get('/notion-tasks-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const report = require('../scripts/notion_tasks_report');
    const tasks = await report.main();
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při reportingu Notion úkolů', detail: e.message });
  }
});
// Spuštění synchronizace doporučení do Notion
router.post('/notion-sync', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const syncNotion = require('../scripts/create_notion_tasks_from_ai');
    await syncNotion.main();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při synchronizaci do Notion', detail: e.message });
  }
});
// Uzavření GitHub Issue (schválení doporučení)
router.post('/github-issues/close', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:approve')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { issue_number } = req.body;
    if (!issue_number) return res.status(400).json({ error: 'Chybí issue_number' });
    const https = require('https');
    const OWNER = 'PatrikLuks';
    const REPO = 'serviskol';
    const TOKEN = process.env.GITHUB_TOKEN;
    if (!TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN není nastaven' });
    const data = JSON.stringify({ state: 'closed' });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/issues/${issue_number}`,
      method: 'PATCH',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'serviskol-ai-bot',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      }
    };
    const reqGit = https.request(options, gitRes => {
      let body = '';
      gitRes.on('data', chunk => body += chunk);
      gitRes.on('end', () => {
        if (gitRes.statusCode >= 200 && gitRes.statusCode < 300) {
          res.json(JSON.parse(body));
        } else {
          res.status(500).json({ error: `GitHub API: ${gitRes.statusCode} ${body}` });
        }
      });
    });
    reqGit.on('error', err => res.status(500).json({ error: err.message }));
    reqGit.write(data);
    reqGit.end();
  } catch (e) {
    res.status(500).json({ error: 'Chyba při uzavírání GitHub Issue', detail: e.message });
  }
});
// Stav doporučení (GitHub Issues z lessons learned/AI)
router.get('/github-issues', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const https = require('https');
    const OWNER = 'PatrikLuks';
    const REPO = 'serviskol';
    const TOKEN = process.env.GITHUB_TOKEN;
    if (!TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN není nastaven' });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/issues?state=all&per_page=100`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'serviskol-ai-bot',
        'Accept': 'application/vnd.github+json'
      }
    };
    const reqGit = https.request(options, gitRes => {
      let body = '';
      gitRes.on('data', chunk => body += chunk);
      gitRes.on('end', () => {
        if (gitRes.statusCode >= 200 && gitRes.statusCode < 300) {
          const issues = JSON.parse(body).filter(i => Array.isArray(i.labels) && i.labels.some(l => l.name === 'ai-recommendation' || l.name === 'retrospective'));
          res.json(issues);
        } else {
          res.status(500).json({ error: `GitHub API: ${gitRes.statusCode} ${body}` });
        }
      });
    });
    reqGit.on('error', err => res.status(500).json({ error: err.message }));
    reqGit.end();
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání GitHub Issues', detail: e.message });
  }
});
// Lessons learned/retrospektiva (Markdown)
router.get('/lessons-learned', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateLessonsLearned = require('../scripts/ai-lessons-learned');
    const { from, to } = req.query;
    const md = await generateLessonsLearned({ from, to });
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování lessons learned' });
  }
});
// Compliance report (PDF)
router.get('/compliance-report/pdf', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateComplianceReport = require('../scripts/ai-compliance-report');
    const md = await generateComplianceReport();
    const markdownpdf = require('markdown-pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="compliance-report.pdf"');
    markdownpdf().from.string(md).to.buffer((err, buffer) => {
      if (err) return res.status(500).json({ error: 'Chyba při generování PDF' });
      res.send(buffer);
    });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování compliance reportu PDF' });
  }
});
// Compliance report (GDPR/ISO, Markdown)
router.get('/compliance-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateComplianceReport = require('../scripts/ai-compliance-report');
    const md = await generateComplianceReport();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování compliance reportu' });
  }
});
// Export alertů/audit logů do SIEM
router.post('/siem-export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const exportToSIEM = require('../scripts/siem-exporter');
    const { type, from, to } = req.body;
    const result = await exportToSIEM({ type, from, to });
    // Audit log
    const { getModel } = require('../db');
    const AuditLog = getModel('AuditLog');
    await AuditLog.create({
      type: 'siem-export',
      action: `Export do SIEM (${type})`,
      details: { type, from, to, sent: result.sent, status: result.status },
      performedBy: user?._id || null,
      createdAt: new Date()
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu do SIEM', detail: e.message });
  }
});
// LLM audit log summary
router.get('/llm-audit-summary', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const llmAuditSummary = require('../scripts/ai-llm-audit-summary');
    const result = await llmAuditSummary();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při LLM shrnutí audit logu' });
  }
});
// AI detekce anomálií v audit logu
router.get('/anomaly-detection', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const detectAnomalies = require('../scripts/ai-anomaly-detector');
    const result = await detectAnomalies();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při detekci anomálií' });
  }
});
// Export audit logu (JSON/CSV) s filtry
router.get('/audit-log/export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const { getModel } = require('../db');
    const AuditLog = getModel('AuditLog');
    const { from, to, type, userEmail, format } = req.query;
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    if (type) filter.type = type;
    if (userEmail) filter['user.email'] = userEmail;
    const logs = await AuditLog.find(filter).lean();
    if (format === 'csv') {
      // CSV export
      const fields = Object.keys(logs[0] || {});
      const csv = [fields.join(',')].concat(
        logs.map(l => fields.map(f => JSON.stringify(l[f] ?? '')).join(','))
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      res.send(csv);
    } else {
      // JSON export
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.json"');
      res.send(JSON.stringify(logs, null, 2));
    }
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu audit logu' });
  }
});
// What-if simulace governance
router.get('/whatif-simulation', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const simulateWhatIf = require('../scripts/ai-whatif-simulation');
    const incidentDelta = parseInt(req.query.incidentDelta || '0', 10);
    const userChangeDelta = parseInt(req.query.userChangeDelta || '0', 10);
    const result = await simulateWhatIf({ incidentDelta, userChangeDelta });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při what-if simulaci' });
  }
});
// Executive summary report (PDF)
router.get('/executive-summary/pdf', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateExecutiveSummary = require('../scripts/ai-executive-summary');
    const md = await generateExecutiveSummary();
    // Dynamicky načti markdown-pdf (nebo použij puppeteer)
    const markdownpdf = require('markdown-pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="executive-summary.pdf"');
    markdownpdf().from.string(md).to.buffer((err, buffer) => {
      if (err) return res.status(500).json({ error: 'Chyba při generování PDF' });
      res.send(buffer);
    });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování executive summary PDF' });
  }
});
// Executive summary report (Markdown)
router.get('/executive-summary', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateExecutiveSummary = require('../scripts/ai-executive-summary');
    const md = await generateExecutiveSummary();
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(md);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování executive summary' });
  }
});
// Governance self-test
router.get('/governance-selftest', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const governanceSelfTest = require('../scripts/ai-governance-selftest');
    const result = await governanceSelfTest();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při self-testu governance pipeline' });
  }
});
// Poslední automatizovaná reakce na vysoké riziko
router.get('/last-automated-risk-response', async (req, res) => {
  try {
    const { getModel } = require('../db');
    const AuditLog = getModel('AuditLog');
    const log = await AuditLog.findOne({ type: 'ai-incident-risk' }).sort({ createdAt: -1 }).lean();
    res.json(log || {});
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání automatizované reakce' });
  }
});
// Predikce rizika incidentů
router.get('/incident-risk-prediction', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const predictIncidentRisk = require('../scripts/ai-incident-risk-predictor');
    const prediction = await predictIncidentRisk();
    res.json(prediction);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při predikci rizika incidentů' });
  }
});
// Export governance report jako JSON (pouze pro adminy)
router.get('/governance-report/export', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:export')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const generateGovernanceReport = require('../scripts/ai-governance-report');
    const report = await generateGovernanceReport();
    res.setHeader('Content-Disposition', 'attachment; filename="governance-report.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(report, null, 2));
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu governance reportu' });
  }
});

const generateGovernanceReport = require('../scripts/ai-governance-report');
// Governance report endpoint
router.get('/governance-report', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('governance:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const report = await generateGovernanceReport();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování governance reportu' });
  }
});
const { Parser } = require('json2csv');
const { adminOnly, adminRole } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// --- BI ENDPOINT: Export kampaní ---
router.get('/bi/campaigns', async (req, res) => {
  // Autentizace přes API klíč v hlavičce X-API-KEY nebo query parametru
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey) return res.status(401).json({ error: 'API klíč je vyžadován.' });
  const user = await User.findOne({ apiKey });
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return res.status(403).json({ error: 'Neplatný nebo nedostatečný API klíč.' });
  // Filtrace podle data
  let { dateFrom, dateTo, format } = req.query;
  let dateFilter = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) dateFilter.$lte = new Date(dateTo);
  let query = {};
  if (dateFrom || dateTo) query.createdAt = dateFilter;
  const campaigns = await Campaign.find(query).lean();
  // Výstup
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'ID', value: '_id' },
      { label: 'Téma', value: 'tema' },
      { label: 'Text', value: 'text' },
      { label: 'Region', value: 'region' },
      { label: 'Věk', value: 'age' },
      { label: 'Počet kliků', value: 'clickCount' },
      { label: 'Počet odeslání', value: 'sentCount' },
      { label: 'Vytvořeno', value: row => row.createdAt ? new Date(row.createdAt).toISOString() : '' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(campaigns);
    res.header('Content-Type', 'text/csv');
    res.attachment('campaigns.csv');
    return res.send(csv);
  }
  // JSON (default)
  res.json(campaigns);
});
// --- DASHBOARD CSV REPORT ---
const { generateDashboardCsv } = require('../utils/csvReport');
router.get('/dashboard-report.csv', adminOnly, adminRole('superadmin'), async (req, res) => {
  let { dateFrom, dateTo } = req.query;
  let dateFilter = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) dateFilter.$lte = new Date(dateTo);
  let campaignQuery = {};
  if (dateFrom || dateTo) campaignQuery.createdAt = dateFilter;
  const campaigns = await Campaign.find(campaignQuery);
  // Statistika
  const ctrTrendData = [];
  const byDate = {};
  campaigns.forEach(c => {
    if (!c.createdAt || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const date = new Date(c.createdAt).toISOString().slice(0,10);
    if (!byDate[date]) byDate[date] = { clicks: 0, sent: 0 };
    byDate[date].clicks += c.clickCount;
    byDate[date].sent += c.sentCount;
  });
  Object.entries(byDate).forEach(([date, v]) => ctrTrendData.push({ date, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const avgCtr = ctrTrendData.length ? ctrTrendData.reduce((a,b)=>a+b.ctr,0)/ctrTrendData.length : 0;
  const campaignCount = campaigns.length;
  // Segmenty
  const bySeg = {};
  campaigns.forEach(c => {
    if (!c.region || !c.age || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const region = c.region;
    const ageGroup = Math.floor(c.age/10)*10;
    const key = region+'_'+ageGroup;
    if (!bySeg[key]) bySeg[key] = { region, ageGroup, clicks: 0, sent: 0 };
    bySeg[key].clicks += c.clickCount;
    bySeg[key].sent += c.sentCount;
  });
  const segmentHeatmapData = Object.values(bySeg).map(v => ({ region: v.region, ageGroup: v.ageGroup, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const topSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>b.ctr-a.ctr).slice(0,3);
  // --- Získat enabledSections z ReportSetting ---
  const ReportSetting = require('../models/ReportSetting');
  let enabledSections = ['aiSummary','ctrTrend','heatmap'];
  try {
    const latestSetting = await ReportSetting.findOne({ enabled: true }).sort({ updatedAt: -1 }).lean();
    if (latestSetting && Array.isArray(latestSetting.enabledSections)) {
      enabledSections = latestSetting.enabledSections;
    }
  } catch {}
  // --- AI sumarizace ---
  let summary = '';
  if (enabledSections.includes('aiSummary')) {
    const bottomSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>a.ctr-b.ctr).slice(0,1);
    const prompt = `Jsi marketingový analytik. Na základě těchto statistik:\n- Průměrné CTR: ${(avgCtr*100).toFixed(2)}%\n- Počet kampaní: ${campaignCount}\n- Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let (CTR ${(topSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\n- Nejslabší segment: ${bottomSegments.length ? `${bottomSegments[0].region}, ${bottomSegments[0].ageGroup} let (CTR ${(bottomSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\nStručně shrň hlavní trendy a doporučení pro růst v nejslabším segmentu. Odpověz česky, max. 3 věty.`;
    let aiSummary = '';
    try {
      const { default: axios } = require('axios');
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (OPENAI_API_KEY) {
        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Jsi marketingový analytik.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.6
        }, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        aiSummary = openaiRes.data.choices[0].message.content.trim();
      }
    } catch (e) {
      aiSummary = '';
    }
    summary = aiSummary || `Průměrné CTR: ${(avgCtr*100).toFixed(2)}%. Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let` : 'N/A'}.`;
  }
  // Vygenerovat CSV
  const csv = generateDashboardCsv({
    stats: { avgCtr, campaignCount, topSegments },
    ctrTrendData: enabledSections.includes('ctrTrend') ? ctrTrendData : [],
    segmentHeatmapData: enabledSections.includes('heatmap') ? segmentHeatmapData : [],
    summary: enabledSections.includes('aiSummary') ? summary : undefined
  });
  // Audit log
  try {
    await AuditLog.create({
      action: 'export_report_csv',
      performedBy: req.user._id,
      details: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (e) { /* ignore logging errors */ }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="dashboard-report.csv"');
  res.send(csv);
});
// --- DASHBOARD XLSX REPORT ---
// GET /api/admin/dashboard-report.xlsx
const { generateDashboardXlsx } = require('../utils/xlsxReport');
router.get('/dashboard-report.xlsx', adminOnly, adminRole('superadmin'), async (req, res) => {
  let { dateFrom, dateTo } = req.query;
  let dateFilter = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) dateFilter.$lte = new Date(dateTo);
  let campaignQuery = {};
  if (dateFrom || dateTo) campaignQuery.createdAt = dateFilter;
  const campaigns = await Campaign.find(campaignQuery);
  // Statistika
  const ctrTrendData = [];
  const byDate = {};
  campaigns.forEach(c => {
    if (!c.createdAt || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const date = new Date(c.createdAt).toISOString().slice(0,10);
    if (!byDate[date]) byDate[date] = { clicks: 0, sent: 0 };
    byDate[date].clicks += c.clickCount;
    byDate[date].sent += c.sentCount;
  });
  Object.entries(byDate).forEach(([date, v]) => ctrTrendData.push({ date, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const avgCtr = ctrTrendData.length ? ctrTrendData.reduce((a,b)=>a+b.ctr,0)/ctrTrendData.length : 0;
  const campaignCount = campaigns.length;
  // Segmenty
  const bySeg = {};
  campaigns.forEach(c => {
    if (!c.region || !c.age || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const region = c.region;
    const ageGroup = Math.floor(c.age/10)*10;
    const key = region+'_'+ageGroup;
    if (!bySeg[key]) bySeg[key] = { region, ageGroup, clicks: 0, sent: 0 };
    bySeg[key].clicks += c.clickCount;
    bySeg[key].sent += c.sentCount;
  });
  const segmentHeatmapData = Object.values(bySeg).map(v => ({ region: v.region, ageGroup: v.ageGroup, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const topSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>b.ctr-a.ctr).slice(0,3);
  // --- Získat enabledSections z ReportSetting ---
  const ReportSetting = require('../models/ReportSetting');
  let enabledSections = ['aiSummary','ctrTrend','heatmap'];
  try {
    const latestSetting = await ReportSetting.findOne({ enabled: true }).sort({ updatedAt: -1 }).lean();
    if (latestSetting && Array.isArray(latestSetting.enabledSections)) {
      enabledSections = latestSetting.enabledSections;
    }
  } catch {}
  // --- AI sumarizace ---
  let summary = '';
  if (enabledSections.includes('aiSummary')) {
    const bottomSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>a.ctr-b.ctr).slice(0,1);
    const prompt = `Jsi marketingový analytik. Na základě těchto statistik:\n- Průměrné CTR: ${(avgCtr*100).toFixed(2)}%\n- Počet kampaní: ${campaignCount}\n- Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let (CTR ${(topSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\n- Nejslabší segment: ${bottomSegments.length ? `${bottomSegments[0].region}, ${bottomSegments[0].ageGroup} let (CTR ${(bottomSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\nStručně shrň hlavní trendy a doporučení pro růst v nejslabším segmentu. Odpověz česky, max. 3 věty.`;
    let aiSummary = '';
    try {
      const { default: axios } = require('axios');
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (OPENAI_API_KEY) {
        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Jsi marketingový analytik.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.6
        }, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        aiSummary = openaiRes.data.choices[0].message.content.trim();
      }
    } catch (e) {
      aiSummary = '';
    }
    summary = aiSummary || `Průměrné CTR: ${(avgCtr*100).toFixed(2)}%. Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let` : 'N/A'}.`;
  }
  // Vygenerovat XLSX
  const xlsxBuffer = await generateDashboardXlsx({
    stats: { avgCtr, campaignCount, topSegments },
    ctrTrendData: enabledSections.includes('ctrTrend') ? ctrTrendData : [],
    segmentHeatmapData: enabledSections.includes('heatmap') ? segmentHeatmapData : [],
    summary: enabledSections.includes('aiSummary') ? summary : undefined
  });
  // Audit log
  try {
    await AuditLog.create({
      action: 'export_report_xlsx',
      performedBy: req.user._id,
      details: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (e) { /* ignore logging errors */ }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="dashboard-report.xlsx"');
  res.send(xlsxBuffer);
});
// --- DASHBOARD PDF REPORT ---
// GET /api/admin/dashboard-report.pdf
const { generateDashboardPdf } = require('../utils/pdfReport');
const Campaign = require('../models/Campaign');
const { generateFollowupSummary } = require('../utils/openai');
const { generateCtrTrendChart } = require('../utils/chartImage');
const { generateSegmentHeatmap } = require('../utils/chartImageHeatmap');
router.get('/dashboard-report.pdf', adminOnly, adminRole('superadmin'), async (req, res) => {
  // Získat časový rozsah z query param (nebo z nastavení)
  let { dateFrom, dateTo } = req.query;
  let dateFilter = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) dateFilter.$lte = new Date(dateTo);
  let campaignQuery = {};
  if (dateFrom || dateTo) campaignQuery.createdAt = dateFilter;
  // Získat data pro statistiky
  const campaigns = await Campaign.find(campaignQuery);
  const ctrTrendData = [];
  const byDate = {};
  campaigns.forEach(c => {
    if (!c.createdAt || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const date = new Date(c.createdAt).toISOString().slice(0,10);
    if (!byDate[date]) byDate[date] = { clicks: 0, sent: 0 };
    byDate[date].clicks += c.clickCount;
    byDate[date].sent += c.sentCount;
  });
  Object.entries(byDate).forEach(([date, v]) => ctrTrendData.push({ date, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const avgCtr = ctrTrendData.length ? ctrTrendData.reduce((a,b)=>a+b.ctr,0)/ctrTrendData.length : 0;
  const campaignCount = campaigns.length;
  // Segmenty
  const bySeg = {};
  campaigns.forEach(c => {
    if (!c.region || !c.age || typeof c.clickCount !== 'number' || typeof c.sentCount !== 'number' || c.sentCount === 0) return;
    const region = c.region;
    const ageGroup = Math.floor(c.age/10)*10;
    const key = region+'_'+ageGroup;
    if (!bySeg[key]) bySeg[key] = { region, ageGroup, clicks: 0, sent: 0 };
    bySeg[key].clicks += c.clickCount;
    bySeg[key].sent += c.sentCount;
  });
  const segmentHeatmapData = Object.values(bySeg).map(v => ({ region: v.region, ageGroup: v.ageGroup, ctr: v.sent ? v.clicks/v.sent : 0 }));
  const topSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>b.ctr-a.ctr).slice(0,3);
  // --- Získat enabledSections z ReportSetting ---
  const ReportSetting = require('../models/ReportSetting');
  let enabledSections = ['aiSummary','ctrTrend','heatmap'];
  try {
    const latestSetting = await ReportSetting.findOne({ enabled: true }).sort({ updatedAt: -1 }).lean();
    if (latestSetting && Array.isArray(latestSetting.enabledSections)) {
      enabledSections = latestSetting.enabledSections;
    }
  } catch {}
  // --- AI sumarizace ---
  let summary = '';
  if (enabledSections.includes('aiSummary')) {
    const bottomSegments = segmentHeatmapData.filter(s => s.ctr > 0).sort((a,b)=>a.ctr-b.ctr).slice(0,1);
    const prompt = `Jsi marketingový analytik. Na základě těchto statistik:\n- Průměrné CTR: ${(avgCtr*100).toFixed(2)}%\n- Počet kampaní: ${campaignCount}\n- Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let (CTR ${(topSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\n- Nejslabší segment: ${bottomSegments.length ? `${bottomSegments[0].region}, ${bottomSegments[0].ageGroup} let (CTR ${(bottomSegments[0].ctr*100).toFixed(1)}%)` : 'N/A'}\nStručně shrň hlavní trendy a doporučení pro růst v nejslabším segmentu. Odpověz česky, max. 3 věty.`;
    let aiSummary = '';
    try {
      const { default: axios } = require('axios');
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
      if (OPENAI_API_KEY) {
        const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Jsi marketingový analytik.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.6
        }, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        aiSummary = openaiRes.data.choices[0].message.content.trim();
      }
    } catch (e) {
      aiSummary = '';
    }
    summary = aiSummary || `Průměrné CTR: ${(avgCtr*100).toFixed(2)}%. Nejlepší segment: ${topSegments.length ? `${topSegments[0].region}, ${topSegments[0].ageGroup} let` : 'N/A'}.`;
  }
  // Vygenerovat PDF s ohledem na enabledSections
  const pdfBuffer = await generateDashboardPdf({
    stats: { avgCtr, campaignCount, topSegments },
    summary: enabledSections.includes('aiSummary') ? summary : undefined,
    ctrTrendPng: enabledSections.includes('ctrTrend') ? ctrTrendPng : undefined,
    heatmapPng: enabledSections.includes('heatmap') ? heatmapPng : undefined
  });
  // Audit log
  try {
    await AuditLog.create({
      action: 'download_report',
      performedBy: req.user._id,
      details: {
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
  } catch (e) { /* ignore logging errors */ }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="dashboard-report.pdf"');
  res.send(pdfBuffer);
});
// --- AI FEEDBACK EXPORT ---
// GET /api/admin/ai-feedback-export?since=YYYY-MM-DD&segment=...&feedback=...&relevance=...&format=csv
router.get('/ai-feedback-export', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { since, segment, feedback, relevance, format } = req.query;
  const q = { aiFeedback: { $exists: true } };
  if (since) q.createdAt = { $gte: new Date(since) };
  if (feedback) q.aiFeedback = feedback;
  if (relevance) q.aiFeedbackRelevance = relevance;
  if (segment) q['segment'] = { $regex: segment, $options: 'i' };
  const AlertLog = require('../models/AlertLog');
  const logs = await AlertLog.find(q).sort({ createdAt: -1 }).lean();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'Segment', value: row => JSON.stringify(row.segment) },
      { label: 'AI návrh', value: row => row.proposedAction?.message || '' },
      { label: 'AI feedback', value: 'aiFeedback' },
      { label: 'Relevance', value: 'aiFeedbackRelevance' },
      { label: 'Komentář', value: 'aiFeedbackComment' },
      { label: 'Schváleno', value: 'approvalStatus' },
      { label: 'Čas', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('ai-feedback.csv');
    return res.send(csv);
  }
  res.json(logs);
});
const SecurityAlert = require('../models/SecurityAlert');
// --- AUDIT LOG: výpis a export ---
// GET /api/admin/audit-log?since=YYYY-MM-DD&action=...&admin=...&format=csv
router.get('/audit-log', adminOnly, adminRole(['superadmin','approver']), async (req, res) => {
  const { since, action, admin, format } = req.query;
  const q = {};
  if (since) q.createdAt = { $gte: new Date(since) };
  if (action) q.action = action;
  if (admin) q.performedBy = admin;
  const logs = await AuditLog.find(q).populate('performedBy', 'name email').populate('targetUser', 'name email').sort({ createdAt: -1 }).lean();
  if (format === 'csv') {
    const { Parser } = require('json2csv');
    const fields = [
      { label: 'Akce', value: 'action' },
      { label: 'Kdo', value: row => row.performedBy?.name || '' },
      { label: 'E-mail', value: row => row.performedBy?.email || '' },
      { label: 'Cílový uživatel', value: row => row.targetUser?.name || '' },
      { label: 'Cílový e-mail', value: row => row.targetUser?.email || '' },
      { label: 'Detaily', value: row => JSON.stringify(row.details) },
      { label: 'Čas', value: row => row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(logs);
    res.header('Content-Type', 'text/csv');
    res.attachment('audit-log.csv');
    return res.send(csv);
  }
  res.json(logs);
});
// --- SPRÁVA ADMINŮ A ROLÍ ---
// ...existing code...
// Enforcement: seznam adminů bez aktivního 2FA
router.get('/enforce-admin-2fa', async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.permissions || !user.permissions.includes('admin:view')) {
      return res.status(403).json({ error: 'Nedostatečná oprávnění' });
    }
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin', twoFactorEnabled: false }).lean();
    res.json({ missing2FA: admins.map(u => ({ email: u.email, name: u.name })) });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při enforcementu 2FA', detail: e.message });
  }
});
// ...existing code...

// GET /admins?role=admin|client|mechanic|all
// reviewer i superadmin mohou číst
router.get('/admins', adminOnly, adminRole(['superadmin','approver']), async (req, res) => {
  const { role } = req.query;
  let query = {};
  if (role && role !== 'all') query.role = role;
  const users = await User.find(query).select('_id name email role adminRole createdAt lastLogin permissions').lean();
  res.json(users);

// GET granularita práv uživatele
router.get('/admins/:id/permissions', adminOnly, adminRole('superadmin'), async (req, res) => {
  const user = await User.findById(req.params.id).select('permissions name email').lean();
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  res.json(user.permissions || []);
});

// PUT granularita práv uživatele
router.put('/admins/:id/permissions', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { permissions } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const prevPermissions = user.permissions || [];
  user.permissions = Array.isArray(permissions) ? permissions : [];
  await user.save();
  await AuditLog.create({
    action: 'Změna granularitních práv',
    performedBy: req.user._id,
    targetUser: user._id,
    details: { prevPermissions, newPermissions: user.permissions },
    createdAt: new Date()
  });
  res.json({ ok: true });
});
});



// PATCH /api/admin/admins/:id/role - změna role uživatele (role i adminRole), audit log, notifikace
router.patch('/admins/:id/role', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { role, adminRole } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const prevRole = user.role;
  const prevAdminRole = user.adminRole;
  if (role && ['client','mechanic','admin'].includes(role)) user.role = role;
  if (adminRole && ['superadmin','approver','readonly'].includes(adminRole)) user.adminRole = adminRole;
  await user.save();
  await AuditLog.create({
    action: 'Změna role uživatele',
    performedBy: req.user._id,
    targetUser: user._id,
    details: { prevRole, newRole: user.role, prevAdminRole, newAdminRole: user.adminRole },
    createdAt: new Date()
  });
  // Notifikace superadminovi
  try {
    const { sendEmail } = require('../utils/notify');
    const superadmins = await User.find({ role: 'admin', adminRole: 'superadmin' }).lean();
    for (const sa of superadmins) {
      await sendEmail({
        to: sa.email,
        subject: 'Bezpečnostní událost: změna role uživatele',
        text: `Uživatel ${user.name} (${user.email}) změnil roli z ${prevRole}/${prevAdminRole} na ${user.role}/${user.adminRole}. Provedl: ${req.user.name} (${req.user.email})`,
        html: `<b>Uživatel:</b> ${user.name} (${user.email})<br/><b>Původní role:</b> ${prevRole}/${prevAdminRole}<br/><b>Nová role:</b> ${user.role}/${user.adminRole}<br/><b>Provedl:</b> ${req.user.name} (${req.user.email})`
      });
    }
  } catch (e) {
    // ignore error, log only
    console.error('Chyba při odesílání notifikace superadminovi:', e);
  }
  res.json({ ok: true });
});
// GET /api/admin/security-alerts - výpis alertů (pouze admin)
router.get('/security-alerts', adminOnly, async (req, res) => {
  const alerts = await SecurityAlert.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'name email').populate('performedBy', 'name email').lean();
  res.json(alerts);
});
// GET /api/admin/me - info o přihlášeném adminovi
router.get('/me', adminOnly, async (req, res) => {
  // ...existing code...
  const user = await User.findById(req.user._id).lean();
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  res.json({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    adminRole: user.adminRole
  });
});
// GET /api/admin/alert-logs/ai-feedback-stats
router.get('/alert-logs/ai-feedback-stats', adminOnly, async (req, res) => {
  const AlertLog = require('../models/AlertLog');
  const { default: dayjs } = require('dayjs');
  const since = req.query.since ? new Date(req.query.since) : dayjs().subtract(90, 'day').toDate();
  const logs = await AlertLog.find({ createdAt: { $gte: since }, proposedAction: { $exists: true } }).lean();
  // Agregace feedbacku
  const feedbackCounts = { excellent: 0, good: 0, neutral: 0, bad: 0, irrelevant: 0 };
  const approvalCounts = { approved: 0, rejected: 0, pending: 0 };
  const bySegment = {};
  logs.forEach(l => {
    feedbackCounts[l.aiFeedback || 'neutral']++;
    approvalCounts[l.approvalStatus || 'pending']++;
    const segKey = l.segment ? Object.entries(l.segment).map(([k,v])=>`${k}:${v}`).join('|') : 'nezadáno';
    if (!bySegment[segKey]) bySegment[segKey] = { total: 0, approved: 0, rejected: 0, feedback: { excellent: 0, good: 0, neutral: 0, bad: 0, irrelevant: 0 } };
    bySegment[segKey].total++;
    if (l.approvalStatus === 'approved') bySegment[segKey].approved++;
    if (l.approvalStatus === 'rejected') bySegment[segKey].rejected++;
    bySegment[segKey].feedback[l.aiFeedback || 'neutral']++;
  });
  res.json({ feedbackCounts, approvalCounts, bySegment });
});
// PATCH /api/admin/alert-logs/:id/ai-feedback
// PATCH /api/admin/alert-logs/:id/ai-feedback (rozšířeno o komentář a relevanceType)
router.patch('/alert-logs/:id/ai-feedback', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { feedback, comment, relevanceType } = req.body;
  if (!['excellent','good','neutral','bad','irrelevant'].includes(feedback)) {
    return res.status(400).json({ error: 'Neplatná hodnota feedbacku.' });
  }
  if (relevanceType && !['relevant','irrelevant'].includes(relevanceType)) {
    return res.status(400).json({ error: 'Neplatný typ relevance.' });
  }
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log) return res.status(404).json({ error: 'Alert nenalezen.' });
  log.aiFeedback = feedback;
  if (comment) log.aiFeedbackComment = comment;
  if (relevanceType) log.aiFeedbackRelevance = relevanceType;
  log.audit = log.audit || [];
  log.audit.push({ event: 'ai-feedback', value: feedback, comment, relevanceType, at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'ok', aiFeedback: log.aiFeedback, comment: log.aiFeedbackComment, relevanceType: log.aiFeedbackRelevance });
});
// GET /api/admin/alert-logs/report
router.get('/alert-logs/report', adminOnly, async (req, res) => {
  const AlertLog = require('../models/AlertLog');
  const { default: dayjs } = require('dayjs');
  const DAYS = 7;
  const ESCALATE_AFTER_DAYS = 7;
  const since = dayjs().subtract(DAYS, 'day').toDate();
  const escalateSince = dayjs().subtract(ESCALATE_AFTER_DAYS, 'day').toDate();
  const [newProposals, approved, rejected, followupSuccess, pending, escalated] = await Promise.all([
    AlertLog.countDocuments({ createdAt: { $gte: since }, approvalStatus: 'pending' }),
    AlertLog.countDocuments({ approvalStatus: 'approved', approvalAt: { $gte: since } }),
    AlertLog.countDocuments({ approvalStatus: 'rejected', approvalAt: { $gte: since } }),
    AlertLog.countDocuments({ actionType: 'followup', actionResult: 'success', actionExecutedAt: { $gte: since } }),
    AlertLog.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }),
    AlertLog.find({ approvalStatus: 'pending', createdAt: { $lte: escalateSince } }).sort({ createdAt: -1 })
  ]);
  res.json({
    stats: {
      newProposals,
      approved,
      rejected,
      followupSuccess,
      pendingCount: pending.length
    },
    pending,
    escalated
  });
});
// PATCH /api/admin/alert-logs/:id
router.patch('/alert-logs/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  if (req.body.proposedAction) {
    log.proposedAction = req.body.proposedAction;
    log.audit = log.audit || [];
    log.audit.push({ event: 'proposed-action-edited', at: new Date(), by: userId });
    await log.save();
    return res.json({ result: 'updated', proposedAction: log.proposedAction });
  }
  res.status(400).json({ error: 'Chybí data pro úpravu.' });
});
// PATCH /api/admin/alert-logs/:id/approve-action
router.patch('/alert-logs/:id/approve-action', adminOnly, adminRole('approver'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  log.approvalStatus = 'approved';
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'action-approved', at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'approved' });
});

// PATCH /api/admin/alert-logs/:id/reject-action
router.patch('/alert-logs/:id/reject-action', adminOnly, adminRole('approver'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.proposedAction || log.approvalStatus !== 'pending') {
    return res.status(404).json({ error: 'Navržená akce nenalezena nebo již byla zpracována.' });
  }
  log.approvalStatus = 'rejected';
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'action-rejected', at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'rejected' });
});
const segmentFollowup = require('./segmentFollowup');
const aiFollowup = require('./aiFollowup');
const abFollowupResults = require('./abFollowupResults');
const abFollowupWinner = require('./abFollowupWinner');
router.use(segmentFollowup);
router.use(aiFollowup);
router.use(abFollowupResults);
router.use(abFollowupWinner);
// GET /api/admin/segment-engagement-trends
router.get('/segment-engagement-trends', adminOnly, async (req, res) => {
  // ...existing code...
  const days = 90;
  const now = new Date();
  const { role, region, ageGroup, channel } = req.query;
  const users = await User.find({
    ...(role ? { role } : {}),
    ...(region ? { region } : {}),
    ...(ageGroup && ageGroup !== 'nezadáno' ? { age: { $gte: Number(ageGroup.split('-')[0]), $lte: Number(ageGroup.split('-')[1]) } } : {})
  });
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Map: date -> count
  const trendMap = {};
  users.forEach(u => {
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel === channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        trendMap[date] = (trendMap[date] || 0) + 1;
      }
    });
  });
  const trend = daysArr.map(date => ({ date, count: trendMap[date] || 0 }));
  res.json({ trend });
});
// POST /api/admin/alert-logs/:id/generate-followup-message
router.post('/alert-logs/:id/generate-followup-message', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { generateFollowupMessage } = require('../utils/openai');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.type !== 'low-ctr-segment') return res.status(404).json({ error: 'Alert typu low-ctr-segment nenalezen.' });
  try {
    const segment = log.segment || {};
    const ctr = typeof log.value === 'number' ? log.value : 0.1;
    const days = log.period && log.period.endsWith('d') ? parseInt(log.period) : 14;
    let message;
    try {
      message = await generateFollowupMessage({ segment, ctr, days });
    } catch (e) {
      // fallback šablona
      message = `Dobrý den, rádi bychom vás znovu oslovili. Pokud jste naši poslední zprávu přehlédli, zkuste ji prosím otevřít – čeká na vás důležitá informace!`;
    }
    // Audit do logu
    log.audit = log.audit || [];
    log.audit.push({ event: 'ai-followup-message-generated', at: new Date(), by: userId });
    await log.save();
    res.json({ message });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování follow-up zprávy.' });
  }
});
// PATCH /api/admin/alert-logs/:id/cancel-followup
router.patch('/alert-logs/:id/cancel-followup', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.actionType !== 'followup' || log.actionResult !== 'scheduled') {
    return res.status(404).json({ error: 'Naplánovaný follow-up nenalezen nebo již byl odeslán.' });
  }
  log.actionResult = 'cancelled';
  await log.save();
  res.json({ result: 'cancelled' });
});
// POST /api/admin/alert-logs/:id/execute-followup
router.post('/alert-logs/:id/execute-followup', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  // ...existing code...
  const Campaign = require('../models/Campaign');
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.actionType !== 'followup') return res.status(404).json({ error: 'Alert nebo follow-up akce nenalezena.' });
  let result = 'not-executed';
  let affected = 0;
  try {
    const seg = req.body.segment || log.segment || {};
    const message = req.body.message || log.followupMessage || 'Děkujeme za zpětnou vazbu, rádi bychom vás znovu oslovili.';
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    // Uložit segment, zprávu a plánovaný čas do AlertLogu
    log.segment = seg;
    log.followupMessage = message;
    log.scheduledAt = scheduledAt;
    // Pokud je scheduledAt v budoucnosti, pouze uložit a neprovádět hned
    if (scheduledAt && scheduledAt > new Date()) {
      log.actionResult = 'scheduled';
      log.actionAffected = 0;
      log.actionExecutedAt = null;
      await log.save();
      return res.json({ result: 'scheduled', affected: 0 });
    }
    // Jinak provést ihned
    const query = {};
    if (seg.role) query.role = seg.role;
    if (seg.region) query.region = seg.region;
    if (seg.ageGroup) {
      const [ageMin, ageMax] = seg.ageGroup.split('-').map(Number);
      query.age = { $gte: ageMin, $lte: ageMax };
    }
    const users = await User.find(query);
    const campaign = new Campaign({
      tema: `Follow-up: ${log.message}`,
      segment: seg,
      variants: [{ label: 'A', text: message, channel: log.channel, sentCount: 0, clickCount: 0 }],
      type: 'auto',
      launchedBy: 'alert-followup',
      scheduledAt: new Date()
    });
    await campaign.save();
    affected = users.length;
    result = 'success';
    log.actionResult = result;
    log.actionAffected = affected;
    log.actionExecutedAt = new Date();
    log.campaignId = campaign._id;
    await log.save();
  } catch (e) {
    result = 'error';
  }
  res.json({ result, affected });
});
// POST /api/admin/alert-logs/:id/execute-action
router.post('/alert-logs/:id/execute-action', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  // ...existing code...
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || !log.action) return res.status(404).json({ error: 'Alert nebo akce nenalezená.' });
  let result = 'not-executed';
  let affected = 0;
  try {
    // Změna preferovaného kanálu pouze pro uživatele v segmentu (možno upravit segment v requestu)
    if (log.type === 'ctr' && log.channel && log.channel !== 'all') {
      const seg = req.body.segment || log.segment || {};
      const query = { preferredChannel: { $ne: log.channel } };
      if (seg.role) query.role = seg.role;
      if (seg.region) query.region = seg.region;
      if (seg.ageGroup) {
        const [ageMin, ageMax] = seg.ageGroup.split('-').map(Number);
        query.age = { $gte: ageMin, $lte: ageMax };
      }
      const users = await User.find(query);
      for (const u of users) {
        u.preferredChannel = log.channel;
        await u.save();
        affected++;
      }
      // Uložit použitý segment do logu
      log.segment = seg;
      result = 'success';
    } else {
      result = 'not-implemented';
    }
  } catch (e) {
    result = 'error';
  }
  log.actionResult = result;
  log.actionAffected = affected;
  log.actionExecutedAt = new Date();
  await log.save();
  res.json({ result, affected });
});
// GET /api/admin/alert-logs/unread
router.get('/alert-logs/unread', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const logs = await AlertLog.find({ admin: userId, read: false }).sort({ createdAt: -1 });
  res.json(logs);
});

// PATCH /api/admin/alert-logs/:id/read
router.patch('/alert-logs/:id/read', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const log = await AlertLog.findOneAndUpdate({ _id: req.params.id, admin: userId }, { read: true }, { new: true });
  if (!log) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json(log);
});
const AlertLog = require('../models/AlertLog');
// GET /api/admin/alert-logs
router.get('/alert-logs', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const query = { admin: userId };
  if (req.query.approvalStatus) query.approvalStatus = req.query.approvalStatus;
// PATCH /api/admin/alert-logs/:id/override-approval
router.patch('/alert-logs/:id/override-approval', adminOnly, adminRole('superadmin'), async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const { newStatus } = req.body;
  if (!['approved','rejected'].includes(newStatus)) {
    return res.status(400).json({ error: 'Neplatný stav.' });
  }
  const log = await AlertLog.findOne({ _id: req.params.id, admin: userId });
  if (!log || log.approvalStatus !== 'auto') return res.status(404).json({ error: 'Auto-schválený návrh nenalezen.' });
  log.approvalStatus = newStatus;
  log.approvalBy = userId;
  log.approvalAt = new Date();
  log.audit = log.audit || [];
  log.audit.push({ event: 'admin-override-auto-approval', newStatus, at: new Date(), by: userId });
  await log.save();
  res.json({ result: 'overridden', approvalStatus: log.approvalStatus });
});
  const logs = await AlertLog.find(query).sort({ createdAt: -1 }).limit(100);
  res.json(logs);
});

// GET /api/admin/alert-logs/export-csv
// Rozšířený export alertů s podporou filtrování a detailními poli
router.get('/alert-logs/export-csv', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const {
    channel,
    type,
    actionType,
    actionResult,
    since,
    until,
    segmentRole,
    segmentRegion,
    segmentAgeGroup
  } = req.query;
  const query = { admin: userId };
  if (channel) query.channel = channel;
  if (type) query.type = type;
  if (actionType) query.actionType = actionType;
  if (actionResult) query.actionResult = actionResult;
  if (since || until) {
    query.createdAt = {};
    if (since) query.createdAt.$gte = new Date(since);
    if (until) query.createdAt.$lte = new Date(until);
  }
  if (segmentRole || segmentRegion || segmentAgeGroup) {
    query["segment"] = query["segment"] || {};
    if (segmentRole) query["segment.role"] = segmentRole;
    if (segmentRegion) query["segment.region"] = segmentRegion;
    if (segmentAgeGroup) query["segment.ageGroup"] = segmentAgeGroup;
  }
  const logs = await AlertLog.find(query).sort({ createdAt: -1 });
  const rows = logs.map(l => ({
    type: l.type,
    channel: l.channel,
    threshold: l.threshold,
    value: l.value,
    period: l.period,
    message: l.message,
    createdAt: l.createdAt,
    action: l.action,
    actionType: l.actionType,
    actionResult: l.actionResult,
    actionAffected: l.actionAffected,
    actionExecutedAt: l.actionExecutedAt,
    followupMessage: l.followupMessage,
    scheduledAt: l.scheduledAt,
    campaignId: l.campaignId,
    segment: l.segment ? JSON.stringify(l.segment) : '',
    audit: l.audit ? JSON.stringify(l.audit) : ''
  }));
  const { Parser } = require('json2csv');
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('alert-logs.csv');
  return res.send(csv);
});
const AlertSetting = require('../models/AlertSetting');
// GET /api/admin/alert-settings
router.get('/alert-settings', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const settings = await AlertSetting.find({ admin: userId });
  res.json(settings);
});

// POST /api/admin/alert-settings
router.post('/alert-settings', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const { type, channel, threshold } = req.body;
  const setting = new AlertSetting({ admin: userId, type, channel, threshold });
  await setting.save();
  res.status(201).json(setting);
});

// PATCH /api/admin/alert-settings/:id
router.patch('/alert-settings/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const { threshold } = req.body;
  const setting = await AlertSetting.findOneAndUpdate({ _id: req.params.id, admin: userId }, { threshold }, { new: true });
  if (!setting) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json(setting);
});

// DELETE /api/admin/alert-settings/:id
router.delete('/alert-settings/:id', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const setting = await AlertSetting.findOneAndDelete({ _id: req.params.id, admin: userId });
  if (!setting) return res.status(404).json({ error: 'Alert nenalezen.' });
  res.json({ success: true });
});
// GET /api/admin/channel-sends-timeseries
router.get('/channel-sends-timeseries', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  const days = 90;
  const now = new Date();
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Inicializace výstupu
  const sends = {};
  ['in-app', 'email', 'push', 'sms'].forEach(channel => {
    sends[channel] = daysArr.map(date => ({ date, count: 0 }));
  });
  // Projít všechny kampaně a naplnit timeseries podle sentCount a scheduledAt
  const CampaignModel = require('../models/Campaign');
  const campaigns = await CampaignModel.find({});
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      const ch = v.channel;
      const sent = v.sentCount || 0;
      const date = v.scheduledAt ? new Date(v.scheduledAt).toISOString().slice(0, 10) : null;
      if (ch && sent && date && sends[ch]) {
        const idx = daysArr.indexOf(date);
        if (idx !== -1) sends[ch][idx].count += sent;
      }
    });
  });
  res.json({ days: daysArr, sends });
});
// GET /api/admin/decision-tree-channel/export-csv
router.get('/decision-tree-channel/export-csv', adminOnly, async (req, res) => {
  // ...existing code...
  const { Parser } = require('json2csv');
  const users = await User.find({});
  const rows = users.map(u => {
    const pred = User.decisionTreeChannel(u);
    return {
      name: u.name || '',
      email: u.email || '',
      role: u.role || '',
      region: u.region || '',
      age: u.age || '',
      currentChannel: u.preferredChannel || '',
      predictedChannel: pred.channel,
      explanation: pred.explanation
    };
  });
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('decision-tree-channel-predictions.csv');
  return res.send(csv);
});
// GET /api/admin/user/:id/decision-tree-channel
router.get('/user/:id/decision-tree-channel', adminOnly, async (req, res) => {
  // ...existing code...
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const result = User.decisionTreeChannel(user);
  res.json(result);
});
// GET /api/admin/segment-engagement-trends/export-csv
router.get('/segment-engagement-trends/export-csv', adminOnly, async (req, res) => {
  // ...existing code...
  const { Parser } = require('json2csv');
  const days = 90;
  const now = new Date();
  const users = await User.find({});
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Segmentace: role, region, věková skupina (10letá okna)
  function getSegment(u) {
    return {
      role: u.role || 'nezadáno',
      region: u.region || 'nezadáno',
      ageGroup: u.age ? `${10 * Math.floor(u.age/10)}-${10 * Math.floor(u.age/10) + 9}` : 'nezadáno'
    };
  }
  // Map: segmentKey -> { date -> {kanál: count} }
  const segMap = {};
  users.forEach(u => {
    const seg = getSegment(u);
    const segKey = `${seg.role}|${seg.region}|${seg.ageGroup}`;
    if (!segMap[segKey]) segMap[segKey] = {};
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        if (!segMap[segKey][date]) segMap[segKey][date] = {};
        segMap[segKey][date][cl.channel] = (segMap[segKey][date][cl.channel] || 0) + 1;
      }
    });
  });
  // Připravit řádky pro CSV
  const rows = [];
  Object.entries(segMap).forEach(([segKey, dateMap]) => {
    const [role, region, ageGroup] = segKey.split('|');
    daysArr.forEach(date => {
      const dayData = dateMap[date] || {};
      ['in-app','email','push','sms'].forEach(channel => {
        rows.push({
          date, role, region, ageGroup, channel, count: dayData[channel] || 0
        });
      });
    });
  });
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('segment-engagement-trends.csv');
  return res.send(csv);
});
// PATCH /api/admin/users/bulk-preferred-channel
router.patch('/users/bulk-preferred-channel', adminOnly, async (req, res) => {
  // ...existing code...
  const { segment, preferredChannel } = req.body;
  if (!segment || !preferredChannel) return res.status(400).json({ error: 'Chybí segment nebo kanál.' });
  if (!['in-app','email','push','sms'].includes(preferredChannel)) return res.status(400).json({ error: 'Neplatný kanál.' });
  // Sestavit query podle segmentu
  const query = {};
  if (segment.role) query.role = segment.role;
  if (segment.region) query.region = segment.region;
  if (segment.ageGroup && segment.ageGroup !== 'nezadáno') {
    const [min, max] = segment.ageGroup.split('-').map(Number);
    query.age = { $gte: min, $lte: max };
  }
  const users = await User.find(query);
  let updatedCount = 0;
  for (const user of users) {
    if (user.preferredChannel !== preferredChannel) {
      const oldChannel = user.preferredChannel;
      user.preferredChannel = preferredChannel;
      await user.save();
      // Audit log
      const { auditLog } = require('../middleware/auditLog');
      auditLog('Hromadná změna preferovaného kanálu', req.user, {
        userId: user._id,
        userEmail: user.email,
        oldChannel,
        newChannel: preferredChannel,
        changedAt: new Date().toISOString(),
        segment
      });
      updatedCount++;
    }
  }
  res.json({ updatedCount });
});
// GET /api/admin/channel-engagement-drop-recommendations
router.get('/channel-engagement-drop-recommendations', adminOnly, async (req, res) => {
  // ...existing code...
  const now = new Date();
  const days = 60; // 30 dní + 30 dní
  const users = await User.find({});
  // Pro každý segment (role, region, věk) spočítat engagement v kanálech za posledních 30 dní a předchozích 30 dní
  const getPeriod = (offset) => {
    const since = new Date(now.getTime() - (offset + 30) * 24 * 60 * 60 * 1000);
    const until = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    return { since, until };
  };
  const periods = [getPeriod(0), getPeriod(30)]; // [posledních 30 dní, předchozích 30 dní]
  // Segmentace: role, region, věková skupina (10letá okna)
  function getSegment(u) {
    return {
      role: u.role || 'nezadáno',
      region: u.region || 'nezadáno',
      ageGroup: u.age ? `${10 * Math.floor(u.age/10)}-${10 * Math.floor(u.age/10) + 9}` : 'nezadáno'
    };
  }
  // Map: segmentKey -> [ {kanál: count}, {kanál: count} ]
  const segMap = {};
  users.forEach(u => {
    const seg = getSegment(u);
    const segKey = `${seg.role}|${seg.region}|${seg.ageGroup}`;
    if (!segMap[segKey]) segMap[segKey] = [ {}, {} ];
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const d = new Date(cl.clickedAt);
        periods.forEach((p, idx) => {
          if (d >= p.since && d < p.until) {
            segMap[segKey][idx][cl.channel] = (segMap[segKey][idx][cl.channel] || 0) + 1;
          }
        });
      }
    });
  });

  // Připravit agregaci pro všechny segmenty a kanály (pro heatmapu)
  const allSegments = [];
  Object.entries(segMap).forEach(([segKey, [recent, prev]]) => {
    const [role, region, ageGroup] = segKey.split('|');
    ['in-app','email','push','sms'].forEach(channel => {
      allSegments.push({
        segment: { role, region, ageGroup },
        channel,
        prev30: prev[channel] || 0,
        last30: recent[channel] || 0
      });
    });
  });

  // Najít segmenty s největším poklesem v některém kanálu (původní logika)
  const recommendations = [];
  Object.entries(segMap).forEach(([segKey, [recent, prev]]) => {
    Object.keys(recent).forEach(channel => {
      const r = recent[channel] || 0;
      const p = prev[channel] || 0;
      if (p > 10 && r < p * 0.7) {
        const drop = p > 0 ? ((p - r) / p) : 0;
        const [role, region, ageGroup] = segKey.split('|');
        recommendations.push({
          segment: { role, region, ageGroup },
          channel,
          prev30: p,
          last30: r,
          drop: +(drop*100).toFixed(1)
        });
      }
    });
  });
  // Seřadit podle největšího poklesu
  recommendations.sort((a, b) => b.drop - a.drop);
  res.json({ allSegments, recommendations });
});
// GET /api/admin/channel-change-log/export-csv
router.get('/channel-change-log/export-csv', adminOnly, (req, res) => {
  const { Parser } = require('json2csv');
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.status(404).send('Log nenalezen.');
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const changes = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Změna preferovaného kanálu');
  const rows = changes.map(c => ({
    userId: c.details.userId,
    userEmail: c.details.userEmail,
    oldChannel: c.details.oldChannel,
    newChannel: c.details.newChannel,
    changedBy: c.user ? (c.user.email || c.user._id || '') : '',
    changedAt: c.details.changedAt
  }));
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('channel-change-log.csv');
  return res.send(csv);
});
// GET /api/admin/channel-engagement-timeseries
router.get('/channel-engagement-timeseries', adminOnly, async (req, res) => {
  // ...existing code...
  const days = 90;
  const now = new Date();
  const users = await User.find({});
  // Připravit pole dnů
  const daysArr = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  // Inicializace výstupu
  const timeseries = {};
  ['in-app', 'email', 'push', 'sms'].forEach(channel => {
    timeseries[channel] = daysArr.map(date => ({ date, count: 0 }));
  });
  // Projít všechny kliky a naplnit timeseries
  users.forEach(u => {
    (u.campaignClicks || []).forEach(cl => {
      if (cl.clickedAt && cl.channel) {
        const date = new Date(cl.clickedAt).toISOString().slice(0, 10);
        const ch = cl.channel;
        if (timeseries[ch]) {
          const idx = daysArr.indexOf(date);
          if (idx !== -1) timeseries[ch][idx].count++;
        }
      }
    });
  });
  res.json({ days: daysArr, timeseries });
});
// GET /api/admin/user/:id/predict-channel
router.get('/user/:id/predict-channel', adminOnly, async (req, res) => {
  // ...existing code...
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const bestChannel = User.predictBestChannel(user);
  res.json({ bestChannel });
});
// PATCH /api/admin/user/:id/preferred-channel
const { captureEvent } = require('../utils/posthog');
router.patch('/user/:id/preferred-channel', adminOnly, async (req, res) => {
  // ...existing code...
  const { preferredChannel } = req.body;
  if (!['in-app', 'email', 'push', 'sms'].includes(preferredChannel)) {
    return res.status(400).json({ error: 'Neplatný kanál.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Uživatel nenalezen.' });
  const oldChannel = user.preferredChannel;
  user.preferredChannel = preferredChannel;
  await user.save();
  // Audit log změny kanálu
  const { auditLog } = require('../middleware/auditLog');
  auditLog('Změna preferovaného kanálu', req.user, {
    userId: user._id,
    userEmail: user.email,
    oldChannel,
    newChannel: preferredChannel,
    changedAt: new Date().toISOString()
  });
  captureEvent(req.user._id?.toString() || req.user.id, 'preferred_channel_changed', {
    userId: user._id,
    userEmail: user.email,
    oldChannel,
    newChannel: preferredChannel
  });
  res.json({ success: true, preferredChannel });
});

// GET /api/admin/channel-engagement-report
router.get('/channel-engagement-report', adminOnly, async (req, res) => {
  // ...existing code...
  // Agregace engagementu podle kanálu
  const users = await User.find({});
  const report = { inApp: 0, email: 0, push: 0, sms: 0 };
  users.forEach(u => {
    if (u.channelEngagement) {
      Object.keys(report).forEach(k => {
        report[k] += u.channelEngagement[k] || 0;
      });
    }
  });
  res.json({ report });
});
// GET /api/admin/campaigns-user-recommendation
router.get('/campaigns-user-recommendation', adminOnly, async (req, res) => {
  // ...existing code...
  // Volitelně: segmentace podle role, regionu, věku
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.region) query.region = req.query.region;
  if (req.query.ageMin) query.age = { ...query.age, $gte: Number(req.query.ageMin) };
  if (req.query.ageMax) query.age = { ...query.age, $lte: Number(req.query.ageMax) };
  // Predikce engagementu: kombinace engagementScore a historie prokliků
  const users = await User.find(query).lean();
  // Vypočítat predikovaný engagement (vážený průměr engagementScore a počtu prokliků za posledních 90 dní)
  const now = new Date();
  const scored = users.map(u => {
    const recentClicks = (u.campaignClicks || []).filter(cl => cl.clickedAt && (now - new Date(cl.clickedAt)) < 90*24*60*60*1000).length;
    const score = (u.engagementScore || 0) * 0.7 + recentClicks * 0.3;
    return { ...u, predictedEngagement: score };
  });
  // Seřadit sestupně podle predikce a vrátit top 10 % (max 100)
  scored.sort((a, b) => b.predictedEngagement - a.predictedEngagement);
  const top = scored.slice(0, Math.max(5, Math.floor(scored.length * 0.1), 100));
  res.json({
    recommendedUsers: top.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      region: u.region,
      age: u.age,
      engagementScore: u.engagementScore,
      predictedEngagement: u.predictedEngagement
    }))
  });
});
// GET /api/admin/campaigns-recommendation
router.get('/campaigns-recommendation', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  // Získat posledních 50 kampaní
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).limit(50).lean();
  // Najít nejúspěšnější segment (region, role, věk...)
  const segmentStats = {};
  for (const c of campaigns) {
    const seg = c.segment || {};
    const key = [seg.role || '', seg.region || '', seg.ageMin || '', seg.ageMax || ''].join('|');
    if (!segmentStats[key]) segmentStats[key] = { sent: 0, clicks: 0, count: 0, example: seg };
    segmentStats[key].sent += c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    segmentStats[key].clicks += c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    segmentStats[key].count++;
  }
  // Najít segment s nejvyšším CTR
  let bestSegment = null, bestCTR = -1;
  Object.values(segmentStats).forEach(s => {
    const ctr = s.sent > 0 ? s.clicks / s.sent : 0;
    if (ctr > bestCTR && s.sent > 20) { // pouze segmenty s dostatečným počtem oslovených
      bestCTR = ctr;
      bestSegment = s.example;
    }
  });
  // Najít nejúspěšnější text/FAQ (nejvyšší průměrný CTR varianty)
  let bestContent = null, bestContentCTR = -1;
  for (const c of campaigns) {
    for (const v of c.variants) {
      const ctr = v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0;
      if (ctr > bestContentCTR && v.text && v.text.length > 10) {
        bestContentCTR = ctr;
        bestContent = { text: v.text, faq: v.faq, ctr };
      }
    }
  }
  res.json({
    recommendedSegment: bestSegment,
    recommendedContent: bestContent
  });
});
// GET /api/admin/campaigns-report
router.get('/campaigns-report', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  // ...existing code...
  // Filtrování podle období, segmentu, typu
  const query = {};
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  if (req.query.type) query.type = req.query.type;
  if (req.query.tema) query.tema = req.query.tema;
  const campaigns = await Campaign.find(query).lean();
  // Agregace dat
  let totalSent = 0, totalClicks = 0, totalFollowUps = 0;
  const segmentStats = {};
  for (const c of campaigns) {
    const sent = c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    const clicks = c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    totalSent += sent;
    totalClicks += clicks;
    if (c.followUpSent) totalFollowUps++;
    // Rozpad podle segmentu (např. region)
    const segKey = c.segment && c.segment.region ? c.segment.region : 'ostatní';
    if (!segmentStats[segKey]) segmentStats[segKey] = { sent: 0, clicks: 0, campaigns: 0 };
    segmentStats[segKey].sent += sent;
    segmentStats[segKey].clicks += clicks;
    segmentStats[segKey].campaigns++;
  }
  // Vývoj v čase (po dnech)
  const byDay = {};
  for (const c of campaigns) {
    const day = c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : 'neznámé';
    if (!byDay[day]) byDay[day] = { sent: 0, clicks: 0, followUps: 0 };
    byDay[day].sent += c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    byDay[day].clicks += c.variants.reduce((sum, v) => sum + (v.clickCount || 0), 0);
    if (c.followUpSent) byDay[day].followUps++;
  }
  // Úspěšnost follow-upů (kolik uživatelů kliklo až po follow-upu)
  let followUpClicks = 0;
  const followUpCampaigns = campaigns.filter(c => c.followUpSent);
  for (const c of followUpCampaigns) {
    // Najít uživatele v segmentu, kteří klikli až po follow-upu
    const buildSegmentQuery = require('../utils/segmentQueryBuilder');
    const userQuery = buildSegmentQuery(c.segment || {});
    const users = await User.find(userQuery);
    for (const user of users) {
      const click = (user.campaignClicks || []).find(cl => cl.campaign === c.tema && cl.clickedAt && c.createdAt && cl.clickedAt > c.createdAt);
      if (click) followUpClicks++;
    }
  }
  res.json({
    totalSent,
    totalClicks,
    totalFollowUps,
    segmentStats,
    byDay,
    followUpClicks
  });
});
// GET /api/admin/campaigns-ab/export-csv
router.get('/campaigns-ab/export-csv', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  const { Parser } = require('json2csv');
  const query = {};
  if (req.query.tema) query.tema = req.query.tema;
  if (req.query.type) query.type = req.query.type;
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  if (req.query.role) query['segment.role'] = req.query.role;
  const campaigns = await Campaign.find(query).lean();
  // Připravit data pro CSV: každý řádek = jedna varianta
  const rows = campaigns.flatMap(c =>
    c.variants.map(v => ({
      tema: c.tema,
      segment: Object.entries(c.segment).map(([k, v]) => `${k}: ${v}`).join(', '),
      type: c.type,
      launchedBy: c.launchedBy,
      createdAt: c.createdAt,
      variant: v.label,
      text: v.text,
      faq: v.faq,
      sentCount: v.sentCount,
      clickCount: v.clickCount
    }))
  );
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('ab_campaigns.csv');
  return res.send(csv);
});
// GET /api/admin/campaigns-ab
router.get('/campaigns-ab', adminOnly, async (req, res) => {
  const Campaign = require('../models/Campaign');
  // Filtrování podle query (tema, od kdy, typ, segment)
  const query = {};
  if (req.query.tema) query.tema = req.query.tema;
  if (req.query.type) query.type = req.query.type;
  if (req.query.since) query.createdAt = { $gte: new Date(req.query.since) };
  // Segment filtr (např. role)
  if (req.query.role) query['segment.role'] = req.query.role;
  const campaigns = await Campaign.find(query).lean();
  // Výstup: pole kampaní s variantami a statistikami
  res.json(campaigns.map(c => ({
    _id: c._id,
    tema: c.tema,
    createdAt: c.createdAt,
    segment: c.segment,
    type: c.type,
    launchedBy: c.launchedBy,
    variants: c.variants.map(v => ({
      label: v.label,
      text: v.text,
      faq: v.faq,
      sentCount: v.sentCount,
      clickCount: v.clickCount
    }))
  })));
});
// POST /api/admin/campaigns/launch-ab
router.post('/campaigns/launch-ab', adminOnly, async (req, res) => {
  // Očekává: { tema, segment, variants: [{label, text, faq}], type, scheduledAt, autoSelectWinner }
  const { tema, segment, variants, type, scheduledAt, autoSelectWinner } = req.body;
  if (!tema || !variants || !Array.isArray(variants) || variants.length < 1) {
    return res.status(400).json({ error: 'Chybí téma nebo varianty.' });
  }
  const Campaign = require('../models/Campaign');
  const { createNotification } = require('../utils/notificationUtils');
  const { auditLog } = require('../middleware/auditLog');
  // Pokud je scheduledAt v budoucnosti, pouze uložit kampaň se stavem 'scheduled'
  let status = 'sent';
  let scheduledDate = null;
  if (scheduledAt) {
    scheduledDate = new Date(scheduledAt);
    if (scheduledDate > new Date()) status = 'scheduled';
  }
  let users = [];
  if (status === 'sent') {
    // Výběr cílové skupiny podle segmentu (pokročilá segmentace)
    const buildSegmentQuery = require('../utils/segmentQueryBuilder');
    const userQuery = buildSegmentQuery(segment || {});
    users = await User.find(userQuery);
    // AI výběr kanálu pro každého uživatele
    function selectBestChannel(user) {
      if (user.preferredChannel && user.channelEngagement && user.channelEngagement[user.preferredChannel.replace('-', '')] > 0) {
        return user.preferredChannel;
      }
      if (user.channelEngagement) {
        const entries = Object.entries(user.channelEngagement);
        const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
        if (best[1] > 0) return best[0] === 'inApp' ? 'in-app' : best[0];
      }
      return user.preferredChannel || 'in-app';
    }
    // Rozdělení uživatelů na varianty (rovnoměrně)
    const userGroups = Array.from({ length: variants.length }, () => []);
    users.forEach((user, idx) => {
      userGroups[idx % variants.length].push(user);
    });
    // Odeslání notifikací a naplnění sentCount
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const group = userGroups[i];
      for (const user of group) {
        const channel = selectBestChannel(user);
        await createNotification({
          user: user._id,
          type: 'info',
          message: variant.text + (variant.faq ? `\nVíce: ${variant.faq}` : ''),
          channel
        });
        // Zaznamenat engagement (zvýšit sentCount pro kanál)
        if (user.channelEngagement) {
          const key = channel === 'in-app' ? 'inApp' : channel;
          user.channelEngagement[key] = (user.channelEngagement[key] || 0) + 1;
          await user.save();
        }
      }
      variants[i].sentCount = group.length;
    }
  }
  // Uložení kampaně do MongoDB
  const campaign = new Campaign({
    tema,
    segment: segment || {},
    variants,
    launchedBy: req.user ? req.user.email : 'admin',
    type: type || 'manual',
    scheduledAt: scheduledDate,
    status,
    autoSelectWinner: !!autoSelectWinner
  });
  await campaign.save();
  // Audit log
  auditLog('Ruční kampaň (A/B)', req.user, {
    tema,
    segment,
    variants: variants.map(v => ({ label: v.label, sentCount: v.sentCount, faq: v.faq })),
    userCount: users.length,
    status,
    scheduledAt: scheduledDate,
    autoSelectWinner: !!autoSelectWinner,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, userCount: users.length, campaignId: campaign._id, status });
});

// GET /api/admin/campaigns
router.get('/campaigns', adminOnly, (req, res) => {
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.json([]);
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  let campaigns = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Automatizovaná kampaň' || l.action === 'Ruční kampaň');
  // Filtrování podle query
  if (req.query.since) {
    campaigns = campaigns.filter(c => c.details.timestamp >= req.query.since);
  }
  if (req.query.tema) {
    campaigns = campaigns.filter(c => c.details.tema === req.query.tema);
  }
  if (req.query.faq) {
    campaigns = campaigns.filter(c => c.details.faq === req.query.faq);
  }
  // Statistika prokliků na FAQ/odkaz
  const clicks = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Kampaň - kliknutí');
  const campaignsWithClicks = campaigns.map(c => {
    const faq = c.details.faq;
    const tema = c.details.tema;
    const clickCount = clicks.filter(cl => {
      // Porovnání podle FAQ a/nebo tématu
      return (faq && cl.details.faq === faq) && (tema ? cl.details.campaign === tema : true);
    }).length;
    return { ...c.details, clickCount };
  });
  // Export do CSV
  if (req.query.format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(campaignsWithClicks);
    res.header('Content-Type', 'text/csv');
    res.attachment('campaigns.csv');
    return res.send(csv);
  }
  res.json(campaignsWithClicks);
});

module.exports = router;
