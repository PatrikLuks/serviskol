// Základ integrace Strava API (OAuth2, získání aktivit)
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const User = require('../models/User');
const { alertAdmins } = require('../utils/notificationUtils');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:5000/api/integrations/strava/callback';

// 1. Přesměrování na Strava autorizaci
router.get('/strava/auth', (req, res) => {
  const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=auto&scope=activity:read_all`;
  res.redirect(url);
});

// 2. Callback z Strava (získání access tokenu)
router.get('/strava/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Chybí kód.');
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.status(400).send('Chyba při získání tokenu.');
  // Uložit access_token uživateli (dle session nebo userId)
  // ... zde by bylo potřeba napojit na uživatelskou session ...
  res.send('Strava účet propojen!');
});

// 3. Získání aktivit uživatele
router.get('/strava/activities', async (req, res) => {
  // Získat access_token uživatele
  // ... zde by bylo potřeba napojit na uživatelskou session ...
  const accessToken = req.query.token;
  if (!accessToken) return res.status(400).json({ msg: 'Chybí access token.' });
  const actRes = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const activities = await actRes.json();
  res.json(activities);
});

module.exports = router;
