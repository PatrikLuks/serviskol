// Testovací skript pro ověření loginu na backendu
const fetch = require('node-fetch');

const email = process.argv[2] || 'testuser@example.com';
const password = process.argv[3] || 'Test1234';

async function testLogin() {
  try {
    const res = await fetch('http://localhost:3001/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Chyba při loginu:', err);
  }
}

testLogin();
