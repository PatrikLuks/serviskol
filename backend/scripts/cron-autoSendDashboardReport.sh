#!/bin/bash
# Spouštět každý den v 7:00 pomocí cron: 0 7 * * *
cd "$(dirname "$0")/.."
NODE_ENV=production node scripts/autoSendDashboardReport.js
