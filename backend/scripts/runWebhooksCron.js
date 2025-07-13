const Webhook = require('../models/Webhook');
const AuditLog = require('../models/AuditLog');
const axios = require('axios');
const { Parser } = require('json2csv');
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const EngagementMetric = require('../models/EngagementMetric');

async function fetchExportData(event, format, filter) {
  if (event === 'bi_export') {
    // Typ exportu podle filtru (např. { type: 'campaigns' })
    if (filter?.type === 'campaigns') {
      const data = await Campaign.find(filter.query || {}).lean();
      if (format === 'csv') {
        const fields = ['_id','tema','text','region','age','clickCount','sentCount','createdAt'];
        return new Parser({ fields }).parse(data);
      }
      return data;
    }
    if (filter?.type === 'segments') {
      const data = await Segment.find(filter.query || {}).lean();
      if (format === 'csv') {
        const fields = ['_id','name','description','createdAt'];
        return new Parser({ fields }).parse(data);
      }
      return data;
    }
    if (filter?.type === 'engagement-metrics') {
      const data = await EngagementMetric.find(filter.query || {}).lean();
      if (format === 'csv') {
        const fields = ['date','channel','sent','opened','clicked','conversions','segment','createdAt'];
        return new Parser({ fields }).parse(data);
      }
      return data;
    }
    if (filter?.type === 'predictions') {
      // BI predikce s granularitou
      const params = [];
      if (filter.segment) params.push('segment=' + encodeURIComponent(filter.segment));
      if (filter.region) params.push('region=' + encodeURIComponent(filter.region));
      if (filter.ageMin) params.push('ageMin=' + encodeURIComponent(filter.ageMin));
      if (filter.ageMax) params.push('ageMax=' + encodeURIComponent(filter.ageMax));
      if (filter.channel) params.push('channel=' + encodeURIComponent(filter.channel));
      if (filter.predType) params.push('type=' + encodeURIComponent(filter.predType));
      const url = `/api/bi/predictions?${params.join('&')}&format=${format}`;
      // Volání interního endpointu přes localhost (předpokládáme běžící server)
      const res = await axios.get('http://localhost:5000' + url);
      return res.data;
    }
  }
  return null;
}

async function deliverWebhook(webhook) {
  try {
    const data = await fetchExportData(webhook.event, webhook.format, webhook.filter);
    const payload = webhook.format === 'csv' ? data : JSON.stringify(data);
    const headers = webhook.format === 'csv' ? { 'Content-Type': 'text/csv' } : { 'Content-Type': 'application/json' };
    const resp = await axios.post(webhook.url, payload, { headers, timeout: 10000 });
    webhook.lastStatus = 'success';
    webhook.lastResponse = resp.status + ' ' + resp.statusText;
    webhook.errorCount = 0;
    webhook.lastTriggered = new Date();
    await webhook.save();
    await AuditLog.create({
      action: 'webhook_deliver',
      performedBy: webhook.createdBy,
      details: { webhookId: webhook._id, url: webhook.url, status: 'success', response: webhook.lastResponse }
    });
  } catch (e) {
    webhook.lastStatus = 'error';
    webhook.lastResponse = e.message;
    webhook.errorCount = (webhook.errorCount || 0) + 1;
    webhook.lastTriggered = new Date();
    await webhook.save();
    await AuditLog.create({
      action: 'webhook_deliver',
      performedBy: webhook.createdBy,
      details: { webhookId: webhook._id, url: webhook.url, status: 'error', error: e.message }
    });
  }
}

module.exports = async function runWebhooksCron() {
  const now = new Date();
  const webhooks = await Webhook.find({ active: true }).lean();
  for (const wh of webhooks) {
    // Rozhodnutí podle frekvence
    let shouldRun = false;
    if (!wh.lastTriggered) shouldRun = true;
    else if (wh.frequency === 'daily') {
      shouldRun = now - new Date(wh.lastTriggered) > 23 * 60 * 60 * 1000;
    } else if (wh.frequency === 'weekly') {
      shouldRun = now - new Date(wh.lastTriggered) > 6 * 24 * 60 * 60 * 1000;
    } else if (wh.frequency === 'monthly') {
      shouldRun = now.getMonth() !== new Date(wh.lastTriggered).getMonth();
    } else if (wh.frequency === 'once' && !wh.lastTriggered) {
      shouldRun = true;
    }
    if (shouldRun) {
      await deliverWebhook(await Webhook.findById(wh._id));
    }
  }
};
