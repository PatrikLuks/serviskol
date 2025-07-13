#!/bin/bash
# Spustí webhook CRON job (doporučeno v crontab nebo PM2)
cd "$(dirname "$0")/.."
NODE_ENV=production node -e "require('./scripts/runWebhooksCron')()"
