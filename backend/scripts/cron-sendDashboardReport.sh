#!/bin/bash
# Spustit každý týden pomocí cron: 0 7 * * 1
cd "$(dirname "$0")/.."
NODE_ENV=production node scripts/sendDashboardReport.js
