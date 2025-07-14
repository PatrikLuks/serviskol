// ...odstraněno nevalidní vložení objektu mimo pole endpoints...
const express = require('express');
const router = express.Router();

// Dynamicky generovaná dokumentace BI API
router.get('/docs', (req, res) => {
  const docs = {
    title: 'ServisKol BI API',
    description: 'Otevřené API pro export dat, reporting a BI integrace. Všechny endpointy vyžadují platný API klíč s odpovídajícími oprávněními.',
    endpoints: [
      {
        path: '/api/bi/ai-segment-history',
        method: 'GET',
        description: 'Export historie změn AI segmentu (JSON)',
        params: [
          { name: 'from', type: 'YYYY-MM-DD', desc: 'Od data (volitelné)' },
          { name: 'to', type: 'YYYY-MM-DD', desc: 'Do data (volitelné)' },
          { name: 'userId', type: 'string', desc: 'ID uživatele (volitelné)' },
          { name: 'apiKey', type: 'string', desc: 'API klíč' }
        ],
        permissions: ['audit:read'],
        example: {
          curl: 'curl "https://serviskol.cz/api/bi/ai-segment-history?from=2025-01-01&apiKey=TVUJ_KLIC"'
        }
      },
      {
        path: '/api/bi/campaigns',
        method: 'GET',
        description: 'Export kampaní (JSON/CSV)',
        params: [
          { name: 'from', type: 'YYYY-MM-DD', desc: 'Od data (volitelné)' },
          { name: 'to', type: 'YYYY-MM-DD', desc: 'Do data (volitelné)' },
          { name: 'format', type: 'csv|json', desc: 'Formát exportu' },
          { name: 'apiKey', type: 'string', desc: 'API klíč (nebo v hlavičce x-api-key)' }
        ],
        permissions: ['campaigns:read', 'export:csv', 'export:json'],
        example: {
          curl: 'curl "https://serviskol.cz/api/bi/campaigns?format=csv&apiKey=TVUJ_KLIC"',
          powerbi: 'https://serviskol.cz/api/bi/campaigns?format=json&apiKey=TVUJ_KLIC'
        }
      },
      {
        path: '/api/bi/segments',
        method: 'GET',
        description: 'Export segmentů (JSON/CSV)',
        params: [
          { name: 'format', type: 'csv|json', desc: 'Formát exportu' },
          { name: 'apiKey', type: 'string', desc: 'API klíč' }
        ],
        permissions: ['segments:read', 'export:csv', 'export:json'],
        example: {
          curl: 'curl "https://serviskol.cz/api/bi/segments?format=json&apiKey=TVUJ_KLIC"'
        }
      },
      {
        path: '/api/bi/engagement-metrics',
        method: 'GET',
        description: 'Export metrik engagementu a retence (JSON/CSV)',
        params: [
          { name: 'from', type: 'YYYY-MM-DD', desc: 'Od data (volitelné)' },
          { name: 'to', type: 'YYYY-MM-DD', desc: 'Do data (volitelné)' },
          { name: 'format', type: 'csv|json', desc: 'Formát exportu' },
          { name: 'apiKey', type: 'string', desc: 'API klíč' }
        ],
        permissions: ['metrics:read', 'export:csv', 'export:json'],
        example: {
          curl: 'curl "https://serviskol.cz/api/bi/engagement-metrics?from=2025-01-01&format=csv&apiKey=TVUJ_KLIC"'
        }
      },
      {
        path: '/api/bi/predictions',
        method: 'GET',
        description: 'Export AI/ML predikcí (churn, followup, segmentace) – JSON/CSV',
        params: [
          { name: 'type', type: 'churn|followup|segment', desc: 'Typ predikce (volitelné)' },
          { name: 'format', type: 'csv|json', desc: 'Formát exportu' },
          { name: 'apiKey', type: 'string', desc: 'API klíč' }
        ],
        permissions: ['predictions:read', 'export:csv', 'export:json'],
        example: {
          curl: 'curl "https://serviskol.cz/api/bi/predictions?type=churn&format=json&apiKey=TVUJ_KLIC"'
        }
      }
    ],
    notes: [
      'API klíč získáš v admin dashboardu (sekce API klíče).',
      'Oprávnění klíče lze granularně nastavit (např. pouze export kampaní, pouze CSV, atd.).',
      'Pro Power BI, Tableau a další BI nástroje použij JSON endpointy.',
      'Všechny akce jsou auditovány pro compliance.'
    ]
  };
  res.json(docs);
  
  // Přidat popis nových endpointů pro AI segmentaci
  /**
   * @api {get} /api/bi/segments/ai Seznam AI segmentů a počty uživatelů
   * @apiName GetAiSegments
   * @apiGroup BI
   * @apiPermission apiKey
   *
   * @apiSuccess {Object[]} aiSegments Pole segmentů a počtů uživatelů.
   *
   * @apiExample {curl} Příklad použití:
   *     curl -H "x-api-key: ..." https://.../api/bi/segments/ai
   */
  
  /**
   * @api {get} /api/bi/users Uživatelé podle AI segmentu
   * @apiName GetUsersByAiSegment
   * @apiGroup BI
   * @apiPermission apiKey
   *
   * @apiParam {String} [aiSegment] Název AI segmentu (VIP, riziko_odchodu, aktivní, ostatní)
   * @apiParam {String} [region] Region
   * @apiParam {Number} [ageMin] Minimální věk
   * @apiParam {Number} [ageMax] Maximální věk
   *
   * @apiSuccess {Object[]} users Pole uživatelů
   *
   * @apiExample {curl} Příklad použití:
   *     curl -H "x-api-key: ..." https://.../api/bi/users?aiSegment=VIP
   */
});

module.exports = router;
